"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { limitReachedMessage } from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import type { WeeklySummary } from "~/domains/weekly-summary/schemas/weekly-summary-schema";
import {
	buildWeeklyFacts,
	findWeeklySummary,
	generateWeeklyText,
	saveWeeklySummary,
} from "~/domains/weekly-summary/services/weekly-summary-service";
import {
	factsPrompt,
	hasWeekData,
	weekStartOf,
} from "~/domains/weekly-summary/utils/weekly-summary";
import { localDateString } from "~/shared/lib/dates";

export type WeeklySummaryResult =
	| { ok: true; data: WeeklySummary }
	| { ok: false; error: string };

/**
 * Gera o resumo da semana (uma vez por semana: se já existe, devolve o
 * salvo sem chamar a IA). Os fatos são calculados aqui no servidor.
 */
export async function generateWeeklySummaryAction(): Promise<WeeklySummaryResult> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) {
		return {
			ok: false,
			error: "Recurso em teste, ainda não liberado pra sua conta.",
		};
	}
	const today = localDateString();
	const weekStart = weekStartOf(today);
	const saved = await findWeeklySummary(user.id, weekStart);
	if (saved) return { ok: true, data: saved };

	const facts = await buildWeeklyFacts(user.id, today);
	if (!hasWeekData(facts)) {
		return {
			ok: false,
			error:
				"Ainda não tem dados recentes pra resumir: marque o check-in e registre seu peso em Medidas.",
		};
	}

	if (!(await consumeAiQuota(user.id, "weekly-summary"))) {
		return { ok: false, error: limitReachedMessage("weekly-summary") };
	}
	const result = await generateWeeklyText(factsPrompt(facts));
	if (!result.ok) {
		await refundAiQuota(user.id, "weekly-summary");
		return result;
	}
	const summary = { weekStart, ...result.summary };
	await saveWeeklySummary(user.id, summary);
	return { ok: true, data: summary };
}

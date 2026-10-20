import "server-only";

import { generateText, NoObjectGeneratedError, Output } from "ai";
import { and, eq } from "drizzle-orm";

import { listCheckins } from "~/domains/checkin/services/checkin-service";
import {
	addDays,
	checkinStreak,
	periodAdherence,
	weekSummary,
} from "~/domains/checkin/utils/checkin";
import { getDiet } from "~/domains/diet/services/diet-service";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import { getCalibrationState } from "~/domains/goal/services/calibration-service";
import { findDietCycle } from "~/domains/goal/services/goal-service";
import { getUserTargets } from "~/domains/goal/services/targets-service";
import { dietDay } from "~/domains/goal/utils/review";
import { planVerdict } from "~/domains/home/utils/home";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import {
	aiWeeklySummarySchema,
	type WeeklySummary,
} from "~/domains/weekly-summary/schemas/weekly-summary-schema";
import {
	measurementChange,
	type WeeklyFacts,
} from "~/domains/weekly-summary/utils/weekly-summary";
import { db } from "~/shared/db";
import { weeklySummary } from "~/shared/db/schema";
import {
	AI_NOT_CONFIGURED,
	AI_RATE_LIMITED,
	getAiModel,
	isRateLimited,
} from "~/shared/lib/ai";

export async function findWeeklySummary(
	userId: string,
	weekStart: string,
): Promise<WeeklySummary | null> {
	const [row] = await db
		.select({
			weekStart: weeklySummary.weekStart,
			title: weeklySummary.title,
			text: weeklySummary.text,
			nextStep: weeklySummary.nextStep,
		})
		.from(weeklySummary)
		.where(
			and(
				eq(weeklySummary.userId, userId),
				eq(weeklySummary.weekStart, weekStart),
			),
		)
		.limit(1);
	return row ?? null;
}

export async function saveWeeklySummary(
	userId: string,
	summary: WeeklySummary,
) {
	await db
		.insert(weeklySummary)
		.values({ userId, ...summary })
		.onConflictDoNothing();
}

/** Os fatos da semana, todos calculados aqui (a IA só escreve o texto). */
export async function buildWeeklyFacts(
	userId: string,
	today: string,
): Promise<WeeklyFacts> {
	const [measurements, checkins, meals, calibration, cycle, plan] =
		await Promise.all([
			listMeasurements(userId),
			listCheckins(userId, addDays(today, -60)),
			getDiet(userId, { createIfEmpty: false }),
			getCalibrationState(userId),
			findDietCycle(userId),
			getUserTargets(userId),
		]);

	const mealCount = meals.filter((meal) => meal.items.length > 0).length;
	const week = weekSummary(checkins, mealCount, today);
	const points = (key: "weightKg" | "waistCm") =>
		measurements.flatMap((m) =>
			m[key] === null ? [] : [{ date: m.measuredOn, value: m[key] }],
		);
	const analysis = calibration?.analysis ?? null;

	return {
		objective: calibration?.goal.objective ?? null,
		weight: measurementChange(points("weightKg"), today),
		waist: measurementChange(points("waistCm"), today),
		adherence:
			periodAdherence(checkins, mealCount, addDays(today, -6), today)
				?.percent ?? null,
		fullDays: week.days.filter((day) => day.state === "full").length,
		streak: checkinStreak(checkins, mealCount, today),
		calibration: analysis && {
			kind: analysis.kind,
			deltaKcal: analysis.kind === "suggest" ? analysis.deltaKcal : null,
			weeklyKg:
				"observedWeeklyKg" in analysis ? analysis.observedWeeklyKg : null,
		},
		reviewDay: cycle?.startedOn ? dietDay(cycle.startedOn, today) : null,
		plan: plan
			? planVerdict(
					summarizeDiet(meals, {
						weightKg: plan.profile.weightKg,
						tdee: plan.tdee,
					}),
					plan.targets,
					plan.proteinCounting,
				).status
			: null,
	};
}

const INSTRUCTIONS = `Você escreve o resumo da semana de uma pessoa que acompanha a própria dieta num app, a partir de fatos calculados pelo app.

Regras:
- Use só os fatos recebidos. Não invente números, alimentos, causas nem metas; pode repetir os números que vieram.
- Linguagem simples, calorosa e direta, em português do Brasil, falando com a pessoa ("você"). Sem gíria de academia.
- Nunca use "déficit", "superávit", "cutting", "bulking" nem "secar": diga "comer menos/mais do que gasta", "perder peso", "ganhar massa".
- Não é prescrição: não mande mudar a meta por conta própria nem fale de doença, remédio ou suplemento.
- Só fale de "card do Início" ou de "sugestão de ajuste" se algum fato usar essas palavras. Diferença entre a dieta montada e a meta (linha "Plano") se resolve na aba Dieta.
- "Sequência" é de dias seguidos com todas as refeições marcadas como seguidas no check-in.
- Reconheça o esforço quando houver (check-ins, sequência, peso no ritmo); se a semana foi fraca, seja gentil e foque no próximo passo.
- O próximo passo é uma ação pequena e prática pros próximos 7 dias (ex.: marcar o check-in todo dia, se pesar no mesmo dia da semana, registrar a cintura).`;

export type GenerateWeeklyResult =
	| { ok: true; summary: Omit<WeeklySummary, "weekStart"> }
	| { ok: false; error: string };

export async function generateWeeklyText(
	prompt: string,
): Promise<GenerateWeeklyResult> {
	const model = getAiModel();
	if (!model) return { ok: false, error: AI_NOT_CONFIGURED };
	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			prompt,
			temperature: 0.7,
			output: Output.object({ schema: aiWeeklySummarySchema }),
		});
		return { ok: true, summary: output };
	} catch (error) {
		console.error("[weekly-summary] falha ao gerar o resumo", error);
		if (isRateLimited(error)) return { ok: false, error: AI_RATE_LIMITED };
		if (NoObjectGeneratedError.isInstance(error)) {
			return { ok: false, error: "Não saiu um bom resumo. Tente de novo." };
		}
		return { ok: false, error: "Não foi possível gerar agora. Tente de novo." };
	}
}

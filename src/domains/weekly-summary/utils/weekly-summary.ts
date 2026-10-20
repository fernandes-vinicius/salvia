import type { Objective } from "~/domains/goal/types/goal-types";
import type { CalibrationAnalysis } from "~/domains/goal/utils/calibration";
import { describeWeeklyChange } from "~/domains/goal/utils/calibration";
import type { PlanVerdict } from "~/domains/home/utils/home";
import { formatFixed, formatNumber } from "~/shared/lib/format";

// Resumo da semana (beta): as contas são todas daqui (peso, cintura,
// adesão, ajuste pelo peso); a IA só escreve o texto a partir desses fatos.

function dayNumber(date: string) {
	return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

/** Segunda-feira da semana de `today` ("YYYY-MM-DD"). */
export function weekStartOf(today: string) {
	const date = new Date(`${today}T12:00:00Z`);
	const offset = (date.getUTCDay() + 6) % 7; // segunda = 0
	date.setUTCDate(date.getUTCDate() - offset);
	return date.toISOString().slice(0, 10);
}

/** Medida mais recente só vale se tiver no máximo 2 semanas. */
const RECENT_DAYS = 14;
/** A comparação é com uma medida de pelo menos 6 dias antes (≈ 1 semana). */
const COMPARE_DAYS = 6;

/** Última medida e quanto mudou desde a de ~1 semana antes. */
export function measurementChange(
	points: { date: string; value: number }[],
	today: string,
) {
	const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
	const last = sorted[sorted.length - 1];
	if (!last || dayNumber(today) - dayNumber(last.date) > RECENT_DAYS) {
		return null;
	}
	const previous = sorted
		.filter((p) => dayNumber(last.date) - dayNumber(p.date) >= COMPARE_DAYS)
		.pop();
	return {
		last: last.value,
		change: previous
			? Math.round((last.value - previous.value) * 10) / 10
			: null,
	};
}

export interface WeeklyFacts {
	objective: Objective | null;
	weight: { last: number; change: number | null } | null;
	waist: { last: number; change: number | null } | null;
	/** % das refeições seguidas nos últimos 7 dias (null sem check-in). */
	adherence: number | null;
	/** Dias completos na dieta nos últimos 7. */
	fullDays: number;
	streak: number;
	calibration: {
		kind: CalibrationAnalysis["kind"];
		deltaKcal: number | null;
		weeklyKg: number | null;
	} | null;
	/** Dia da dieta (desde o começo), null sem meta. */
	reviewDay: number | null;
	plan: PlanVerdict["status"] | null;
}

/** Tem o mínimo pra valer um resumo (peso, medida ou check-in recentes). */
export function hasWeekData(facts: WeeklyFacts) {
	return (
		facts.weight !== null || facts.waist !== null || facts.adherence !== null
	);
}

const OBJECTIVES: Record<Objective, string> = {
	lose: "perder peso",
	maintain: "manter o peso",
	gain: "ganhar massa",
};

const signed = (value: number, unit: string, digits = 1) =>
	`${value > 0 ? "+" : value < 0 ? "−" : ""}${digits ? formatFixed(Math.abs(value)) : formatNumber(Math.abs(value))} ${unit}`;

const PLAN: Record<PlanVerdict["status"], string> = {
	empty: "a dieta ainda está vazia (dá pra montar na aba Dieta)",
	"on-target": "a dieta montada fecha com a meta",
	below:
		"a dieta montada na aba Dieta tem menos calorias que a meta; dá pra completar lá",
	above:
		"a dieta montada na aba Dieta passa um pouco da meta; dá pra acertar as quantidades lá",
};

/** Os fatos como vão pro prompt, uma linha cada. */
export function factsPrompt(facts: WeeklyFacts) {
	const lines: string[] = [];
	if (facts.objective) lines.push(`Objetivo: ${OBJECTIVES[facts.objective]}.`);
	if (facts.reviewDay !== null) lines.push(`Dia ${facts.reviewDay} da dieta.`);
	if (facts.weight) {
		lines.push(
			`Peso: ${formatFixed(facts.weight.last)} kg${facts.weight.change !== null ? ` (${signed(facts.weight.change, "kg")} na semana)` : " (sem pesagem da semana anterior pra comparar)"}.`,
		);
	} else {
		lines.push("Peso: sem pesagem nas últimas 2 semanas.");
	}
	if (facts.waist) {
		lines.push(
			`Cintura: ${formatNumber(facts.waist.last)} cm${facts.waist.change !== null ? ` (${signed(facts.waist.change, "cm", 0)})` : ""}.`,
		);
	}
	lines.push(
		facts.adherence === null
			? "Check-in: nenhum nos últimos 7 dias."
			: `Check-in: seguiu ${facts.adherence}% das refeições marcadas nos últimos 7 dias, ${facts.fullDays} ${facts.fullDays === 1 ? "dia completo" : "dias completos"}, sequência atual de ${facts.streak} ${facts.streak === 1 ? "dia" : "dias"}.`,
	);
	const c = facts.calibration;
	if (c) {
		if (c.kind === "need-data") {
			lines.push(
				"Ajuste pelo peso: ainda faltam pesagens pra conferir o ritmo.",
			);
		} else if (c.kind === "on-track" && c.weeklyKg !== null) {
			lines.push(
				`Ajuste pelo peso: no ritmo da meta (${describeWeeklyChange(c.weeklyKg)} por semana).`,
			);
		} else if (c.kind === "low-adherence") {
			lines.push(
				"Ajuste pelo peso: fora do ritmo, mas a dieta foi pouco seguida; o app pede pra seguir mais antes de mudar a meta.",
			);
		} else if (c.kind === "suggest" && c.deltaKcal !== null) {
			lines.push(
				`Ajuste pelo peso: o app sugere comer ${formatNumber(Math.abs(c.deltaKcal))} kcal a ${c.deltaKcal < 0 ? "menos" : "mais"} por dia; a sugestão de ajuste fica no card do Início e a pessoa decide.`,
			);
		}
	}
	if (facts.plan) lines.push(`Plano: ${PLAN[facts.plan]}.`);
	return lines.join("\n");
}

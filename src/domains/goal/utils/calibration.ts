import { weeklyChangeKg } from "~/domains/goal/utils/goal";

// Ajuste automático da meta pelo peso real. A fórmula estima o gasto; o peso
// mostra o gasto de verdade. Com pesagens suficientes, compara o ritmo real
// (tendência por regressão linear, que ignora o sobe-e-desce de água) com o
// ritmo esperado da meta e converte a diferença em kcal/dia.
//
// Premissa: a pessoa seguiu a dieta. Com check-ins suficientes, a adesão
// confirma isso: abaixo de 80% das refeições, o peso não diz se a conta
// errou, então o app pede pra seguir a dieta antes de mexer na meta. O ajuste
// é sugerido, nunca automático, e em passos pequenos.

export const CALIBRATION_RULES = {
	/** Pesagens mínimas dentro da janela. */
	minWeighIns: 3,
	/** Dias mínimos entre a primeira e a última pesagem. */
	minDays: 14,
	/** Só olha as últimas semanas (o corpo muda; dado antigo atrapalha). */
	windowDays: 42,
	/** Diferenças menores que isso são ruído: "está no ritmo". */
	minSuggestKcal: 100,
	/** Maior ajuste de uma vez; se precisar de mais, o próximo ciclo pega. */
	maxStepKcal: 300,
	roundTo: 50,
	/** Adesão mínima (% das refeições) pra confiar no peso. */
	minAdherence: 80,
	/** Dias com check-in pra adesão contar (menos que isso é pouco dado). */
	minAdherenceDays: 5,
} as const;

/** kcal/dia por kg/semana de diferença (7700 kcal ≈ 1 kg ÷ 7 dias). */
const KCAL_PER_DAY_PER_WEEKLY_KG = 7700 / 7;

export interface WeighIn {
	/** "YYYY-MM-DD" (data local). */
	date: string;
	weightKg: number;
}

export type CalibrationAnalysis =
	| {
			kind: "need-data";
			weighIns: number;
			/** Dias entre a primeira e a última pesagem da janela. */
			days: number;
	  }
	| {
			kind: "on-track";
			observedWeeklyKg: number;
			expectedWeeklyKg: number;
			days: number;
			/** % das refeições seguidas no período (null sem check-ins). */
			adherence: number | null;
	  }
	| {
			kind: "suggest";
			observedWeeklyKg: number;
			expectedWeeklyKg: number;
			days: number;
			/** kcal/dia a somar ao gasto (negativo = comer menos). */
			deltaKcal: number;
			adherence: number | null;
	  }
	| {
			/** Fora do ritmo, mas a dieta foi pouco seguida: não ajusta. */
			kind: "low-adherence";
			observedWeeklyKg: number;
			expectedWeeklyKg: number;
			days: number;
			adherence: number;
	  };

interface AnalyzeInput {
	weighIns: WeighIn[];
	/** "YYYY-MM-DD" de hoje (data local). */
	today: string;
	/** Último ajuste aplicado ("YYYY-MM-DD"): a análise recomeça daqui. */
	since: string | null;
	/** Ajuste de kcal da meta (o que define o ritmo esperado). */
	calorieAdjustment: number;
	/** Adesão do check-in na janela (`calibrationWindowStart` até hoje). */
	adherence?: { percent: number; days: number } | null;
}

function dayNumber(date: string) {
	return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

function dateOf(day: number) {
	return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

/** Primeiro dia que a análise olha: 6 semanas atrás ou o último ajuste. */
export function calibrationWindowStart(today: string, since: string | null) {
	return dateOf(
		Math.max(
			dayNumber(today) - CALIBRATION_RULES.windowDays,
			since ? dayNumber(since) : Number.NEGATIVE_INFINITY,
		),
	);
}

/** Inclinação (kg/dia) da reta que melhor passa pelos pontos. */
function trendPerDay(points: { day: number; weightKg: number }[]) {
	const n = points.length;
	const meanDay = points.reduce((sum, p) => sum + p.day, 0) / n;
	const meanWeight = points.reduce((sum, p) => sum + p.weightKg, 0) / n;
	let numerator = 0;
	let denominator = 0;
	for (const p of points) {
		numerator += (p.day - meanDay) * (p.weightKg - meanWeight);
		denominator += (p.day - meanDay) ** 2;
	}
	return denominator === 0 ? 0 : numerator / denominator;
}

export function analyzeCalibration({
	weighIns,
	today,
	since,
	calorieAdjustment,
	adherence: rawAdherence = null,
}: AnalyzeInput): CalibrationAnalysis {
	const todayNumber = dayNumber(today);
	const start = dayNumber(calibrationWindowStart(today, since));
	const adherence =
		rawAdherence && rawAdherence.days >= CALIBRATION_RULES.minAdherenceDays
			? rawAdherence.percent
			: null;
	const points = weighIns
		.map((w) => ({ day: dayNumber(w.date), weightKg: w.weightKg }))
		.filter((p) => p.day >= start && p.day <= todayNumber)
		.sort((a, b) => a.day - b.day);

	const days =
		points.length > 0 ? points[points.length - 1].day - points[0].day : 0;

	if (
		points.length < CALIBRATION_RULES.minWeighIns ||
		days < CALIBRATION_RULES.minDays
	) {
		return { kind: "need-data", weighIns: points.length, days };
	}

	const observedWeeklyKg = trendPerDay(points) * 7;
	const expectedWeeklyKg = weeklyChangeKg(calorieAdjustment);
	const rawDelta =
		(expectedWeeklyKg - observedWeeklyKg) * KCAL_PER_DAY_PER_WEEKLY_KG;

	if (Math.abs(rawDelta) < CALIBRATION_RULES.minSuggestKcal) {
		return {
			kind: "on-track",
			observedWeeklyKg,
			expectedWeeklyKg,
			days,
			adherence,
		};
	}

	if (adherence !== null && adherence < CALIBRATION_RULES.minAdherence) {
		return {
			kind: "low-adherence",
			observedWeeklyKg,
			expectedWeeklyKg,
			days,
			adherence,
		};
	}

	const { roundTo, maxStepKcal } = CALIBRATION_RULES;
	const rounded = Math.round(rawDelta / roundTo) * roundTo;
	const deltaKcal = Math.max(-maxStepKcal, Math.min(maxStepKcal, rounded));

	return {
		kind: "suggest",
		observedWeeklyKg,
		expectedWeeklyKg,
		days,
		deltaKcal,
		adherence,
	};
}

/** "perdendo 0,4 kg", "ganhando 0,2 kg" ou "mantendo o peso". */
export function describeWeeklyChange(weeklyKg: number) {
	const kg = Math.abs(weeklyKg).toLocaleString("pt-BR", {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1,
	});
	if (Math.abs(weeklyKg) < 0.05) return "mantendo o peso";
	return weeklyKg < 0 ? `perdendo ${kg} kg` : `ganhando ${kg} kg`;
}

/** Pesagens a partir das medidas (só as que têm peso). */
export function toWeighIns(
	measurements: { measuredOn: string; weightKg: number | null }[],
): WeighIn[] {
	return measurements.flatMap((m) =>
		m.weightKg === null ? [] : [{ date: m.measuredOn, weightKg: m.weightKg }],
	);
}

/** Correção acumulada máxima (kcal/dia), pra um erro de pesagem não levar longe. */
export const MAX_CALIBRATION_KCAL = 800;

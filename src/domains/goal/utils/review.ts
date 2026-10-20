import type { WeighIn } from "~/domains/goal/utils/calibration";

// Revisões da dieta: no dia 15, no 30 e depois a cada 30 dias, o app junta o
// peso desde o começo, a adesão do check-in e o ajuste pelo peso, e traduz a
// sugestão em gramas de carboidrato. As contas do ajuste continuam em
// `analyzeCalibration`; aqui só o calendário e as conversões.

/** Primeiros marcos; depois deles, a cada `REVIEW_EVERY` dias. */
export const REVIEW_CHECKPOINTS = [15, 30] as const;
const REVIEW_EVERY = 30;

function dayNumber(date: string) {
	return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

/** Dia da dieta (o dia do começo é o 1). */
export function dietDay(startedOn: string, today: string) {
	return dayNumber(today) - dayNumber(startedOn) + 1;
}

/** Próximo marco depois do último revisado. */
export function nextCheckpoint(reviewedDay: number) {
	const first = REVIEW_CHECKPOINTS.find((day) => day > reviewedDay);
	if (first) return first;
	const last = REVIEW_CHECKPOINTS[REVIEW_CHECKPOINTS.length - 1];
	return (
		last + Math.ceil((reviewedDay + 1 - last) / REVIEW_EVERY) * REVIEW_EVERY
	);
}

/** Marco anterior (0 antes do primeiro), pra barra de progresso. */
export function previousCheckpoint(checkpoint: number) {
	const index = REVIEW_CHECKPOINTS.indexOf(
		checkpoint as (typeof REVIEW_CHECKPOINTS)[number],
	);
	if (index === 0) return 0;
	if (index > 0) return REVIEW_CHECKPOINTS[index - 1];
	return checkpoint - REVIEW_EVERY;
}

export interface ReviewStatus {
	day: number;
	/** Marco da revisão (pendente ou a próxima). */
	checkpoint: number;
	due: boolean;
	/** Dias até o marco (0 quando pendente). */
	daysLeft: number;
}

export function reviewStatus({
	startedOn,
	reviewedDay,
	today,
}: {
	startedOn: string | null;
	reviewedDay: number;
	today: string;
}): ReviewStatus | null {
	if (!startedOn) return null;
	const day = dietDay(startedOn, today);
	let checkpoint = nextCheckpoint(reviewedDay);
	if (day < checkpoint) {
		return { day, checkpoint, due: false, daysLeft: checkpoint - day };
	}
	// Ficou sem abrir o app por mais de um marco: revisa só o mais recente.
	while (nextCheckpoint(checkpoint) <= day)
		checkpoint = nextCheckpoint(checkpoint);
	return { day, checkpoint, due: true, daysLeft: 0 };
}

/** Pesagem de até 3 dias antes do começo ainda vale como "peso inicial". */
const START_TOLERANCE_DAYS = 3;

/** Peso no começo da dieta × a pesagem mais recente. */
export function weightSince(weighIns: WeighIn[], startedOn: string) {
	const from = dayNumber(startedOn) - START_TOLERANCE_DAYS;
	const points = weighIns
		.filter((w) => dayNumber(w.date) >= from)
		.sort((a, b) => a.date.localeCompare(b.date));
	if (points.length < 2) return null;
	const fromKg = points[0].weightKg;
	const toKg = points[points.length - 1].weightKg;
	return { fromKg, toKg, changeKg: Math.round((toKg - fromKg) * 10) / 10 };
}

/** Arroz branco cozido (TACO): 28,1 g de carboidrato em 100 g. */
const RICE_CARBS_PER_100G = 28.1;

/** Ajuste em kcal como carboidrato: gramas (de 5 em 5) e arroz cozido (de 10 em 10). */
export function carbsForKcal(kcal: number) {
	const carbs = Math.abs(kcal) / 4;
	return {
		carbsGrams: Math.round(carbs / 5) * 5,
		riceGrams: Math.round((carbs / RICE_CARBS_PER_100G) * 10) * 10,
	};
}

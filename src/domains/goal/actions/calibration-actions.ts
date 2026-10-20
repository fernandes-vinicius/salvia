"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getCalibrationState } from "~/domains/goal/services/calibration-service";
import {
	findDietCycle,
	restartDietCycle,
	saveGoalCalibration,
	saveReviewedDay,
} from "~/domains/goal/services/goal-service";
import { MAX_CALIBRATION_KCAL } from "~/domains/goal/utils/calibration";
import { reviewStatus } from "~/domains/goal/utils/review";
import { localDateString } from "~/shared/lib/dates";

/** Revisão pendente agora (lida do banco), ou null. */
async function dueReview(userId: string) {
	const cycle = await findDietCycle(userId);
	if (!cycle) return null;
	const status = reviewStatus({ ...cycle, today: localDateString() });
	return status?.due ? status : null;
}

export type CalibrationActionResult =
	| { ok: true; deltaKcal: number }
	| { ok: false; error: string };

// Aplica a sugestão do ajuste pelo peso. Recalcula no servidor a partir das
// pesagens salvas (não confia em valor vindo do navegador).
export async function applyCalibrationAction(): Promise<CalibrationActionResult> {
	const user = await getCurrentUser();
	const state = await getCalibrationState(user.id);

	if (state?.analysis.kind !== "suggest") {
		return { ok: false, error: "Não há ajuste pra aplicar agora." };
	}

	const { deltaKcal } = state.analysis;
	const next = Math.max(
		-MAX_CALIBRATION_KCAL,
		Math.min(MAX_CALIBRATION_KCAL, state.calibration.kcal + deltaKcal),
	);
	await saveGoalCalibration(user.id, next);
	// Aplicar o ajuste durante uma revisão já conclui a revisão.
	const review = await dueReview(user.id);
	if (review) await saveReviewedDay(user.id, review.checkpoint);
	return { ok: true, deltaKcal: next - state.calibration.kcal };
}

/** Volta pro gasto calculado pela fórmula (zera os ajustes pelo peso). */
export async function resetCalibrationAction(): Promise<CalibrationActionResult> {
	const user = await getCurrentUser();
	const state = await getCalibrationState(user.id);
	if (!state) return { ok: false, error: "Defina sua meta primeiro." };

	await saveGoalCalibration(user.id, 0);
	return { ok: true, deltaKcal: -state.calibration.kcal };
}

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

/** "Concluir revisão": marca o marco pendente (15, 30…) como revisado. */
export async function completeReviewAction(): Promise<ReviewActionResult> {
	const user = await getCurrentUser();
	const review = await dueReview(user.id);
	if (!review) return { ok: false, error: "Não há revisão pendente agora." };
	await saveReviewedDay(user.id, review.checkpoint);
	return { ok: true };
}

/** "Recomeçar a contagem": a dieta passa a contar de hoje (dia 1). */
export async function restartDietCycleAction(): Promise<ReviewActionResult> {
	const user = await getCurrentUser();
	if (!(await findDietCycle(user.id))) {
		return { ok: false, error: "Defina sua meta primeiro." };
	}
	await restartDietCycle(user.id);
	return { ok: true };
}

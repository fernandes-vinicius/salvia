"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getCalibrationState } from "~/domains/goal/services/calibration-service";
import { saveGoalCalibration } from "~/domains/goal/services/goal-service";
import { MAX_CALIBRATION_KCAL } from "~/domains/goal/utils/calibration";

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

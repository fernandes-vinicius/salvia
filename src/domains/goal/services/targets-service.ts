import "server-only";

import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import { calculateTargets } from "~/domains/goal/utils/goal";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { calculateBmr, calculateTdee } from "~/domains/profile/utils/energy";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";

/**
 * Metas do dia lidas do banco (TMB + Meta + ajuste pelo peso), igual às
 * abas. Null sem TMB ou sem Meta. Pras actions que não confiam no navegador.
 */
export async function getUserTargets(userId: string) {
	const [profile, goal, settings, calibration] = await Promise.all([
		findProfileByUserId(userId),
		findGoalByUserId(userId),
		getSettingsByUserId(userId),
		findGoalCalibration(userId),
	]);
	if (!profile || !goal) return null;
	const tdee = calculateTdee(profile, settings.bmrFormula) + calibration.kcal;
	return {
		profile,
		tdee,
		proteinCounting: settings.proteinCounting,
		targets: calculateTargets(goal, {
			tdee,
			bmr: calculateBmr(profile, settings.bmrFormula),
			weightKg: profile.weightKg,
		}),
	};
}

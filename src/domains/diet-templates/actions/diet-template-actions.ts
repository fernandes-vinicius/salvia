"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { findTemplate } from "~/domains/diet-templates/data/templates";
import {
	applyTemplateMeals,
	getTemplateFoods,
} from "~/domains/diet-templates/services/diet-template-service";
import { personalizeTemplate } from "~/domains/diet-templates/utils/personalize";
import { resolveTemplate } from "~/domains/diet-templates/utils/resolve";
import { calculateTargets } from "~/domains/goal";
import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";

export type ApplyTemplateResult =
	| { ok: true; personalized: boolean }
	| { ok: false; error: string };

/**
 * Cria a dieta do usuário a partir de um modelo, com as quantidades ajustadas
 * às metas dele (calculadas aqui no servidor a partir da TMB e da Meta).
 */
export async function applyDietTemplateAction(
	templateId: unknown,
): Promise<ApplyTemplateResult> {
	const user = await getCurrentUser();
	const parsed = z.string().max(64).safeParse(templateId);
	const template = parsed.success ? findTemplate(parsed.data) : null;
	if (!template) return { ok: false, error: "Dieta pronta não encontrada." };

	const [foods, profile, goal, settings, calibration] = await Promise.all([
		getTemplateFoods(user.id),
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
		findGoalCalibration(user.id),
	]);

	const targets =
		profile && goal
			? calculateTargets(goal, {
					tdee: calculateTdee(profile, settings.bmrFormula) + calibration.kcal,
					bmr: calculateBmr(profile, settings.bmrFormula),
					weightKg: profile.weightKg,
				})
			: null;
	const meals = personalizeTemplate(
		resolveTemplate(template, foods),
		targets && {
			protein: targets.protein.grams,
			carbs: targets.carbs.grams,
			fat: targets.fat.grams,
		},
		settings.proteinCounting,
	);

	await applyTemplateMeals(user.id, meals);
	return { ok: true, personalized: targets !== null };
}

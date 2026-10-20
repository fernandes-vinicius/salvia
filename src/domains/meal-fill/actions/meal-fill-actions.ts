"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { limitReachedMessage } from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import { foodsForSwaps } from "~/domains/food/services/food-service";
import { getUserTargets } from "~/domains/goal/services/targets-service";
import {
	type MealFill,
	suggestMealFillInputSchema,
} from "~/domains/meal-fill/schemas/meal-fill-schema";
import { suggestMealFill } from "~/domains/meal-fill/services/meal-fill-service";
import {
	fillQuantities,
	hasMeaningfulGap,
	macroGap,
} from "~/domains/meal-fill/utils/meal-fill";
import {
	fillCandidates,
	fillPrompt,
} from "~/domains/meal-fill/utils/meal-fill-prompt";
import {
	MAIN_DISH_FOODS,
	SWAP_FOODS,
} from "~/domains/meal-recipe/data/swap-foods";
import { isLightMeal } from "~/domains/meal-recipe/utils/recipe-swap";

export type MealFillResult =
	| { ok: true; data: MealFill }
	| { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const BETA_ONLY = "Recurso em teste, ainda não liberado pra sua conta.";

/** Fontes de gordura além da base das trocas (que só tem oleaginosas). */
const FILL_EXTRA_FOODS = ["Azeite, de oliva, extra virgem", "Abacate, cru"];

/**
 * "Completar com IA": calcula no servidor o que falta pra meta do dia, a IA
 * escolhe alimentos que combinem com a refeição e as quantidades saem da
 * conta (`fillQuantities`). Nada é salvo aqui: a tela adiciona com
 * "Desfazer".
 */
export async function suggestMealFillAction(
	input: unknown,
): Promise<MealFillResult> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) return fail(BETA_ONLY);
	const parsed = suggestMealFillInputSchema.safeParse(input);
	if (!parsed.success) return fail("Refeição inválida.");

	const [meals, plan] = await Promise.all([
		getDiet(user.id, { createIfEmpty: false }),
		getUserTargets(user.id),
	]);
	const meal = meals.find((entry) => entry.id === parsed.data.mealId);
	if (!meal) return fail("Essa refeição não existe mais.");
	if (!plan) return fail("Preencha a TMB e a Meta primeiro.");

	const summary = summarizeDiet(meals, {
		weightKg: plan.profile.weightKg,
		tdee: plan.tdee,
	});
	const gap = macroGap(summary, plan.targets, plan.proteinCounting);
	if (!hasMeaningfulGap(gap)) {
		return fail(
			"Sua dieta já está na meta do dia. Não falta nada pra completar.",
		);
	}

	const foods = await foodsForSwaps(
		user.id,
		[...SWAP_FOODS, ...FILL_EXTRA_FOODS],
		true,
	);
	const candidates = fillCandidates(foods, gap, {
		excludeNames: [
			...(isLightMeal(meal) ? MAIN_DISH_FOODS : []),
			// O que a refeição já tem não entra de novo.
			...meal.items.map((item) => item.food.name),
		],
	});
	if (candidates.length === 0) {
		return fail("Não achei alimentos pra completar essa refeição.");
	}

	if (!(await consumeAiQuota(user.id, "meal-fill"))) {
		return fail(limitReachedMessage("meal-fill"));
	}
	const result = await suggestMealFill(
		fillPrompt({ meal, gap, candidates, avoid: parsed.data.avoid }),
	);
	if (!result.ok) {
		await refundAiQuota(user.id, "meal-fill");
		return result;
	}

	// Código inventado é ignorado; cada alimento entra uma vez.
	const picked = [...new Set(result.fill.picks)]
		.map((code) => candidates.find((c) => c.code === code)?.food)
		.filter((food) => food !== undefined)
		.slice(0, 3);
	const items = fillQuantities(picked, gap, plan.proteinCounting);
	if (items.length === 0) {
		await refundAiQuota(user.id, "meal-fill");
		return fail("Não saiu uma boa sugestão. Tente de novo.");
	}
	return {
		ok: true,
		data: {
			title: result.fill.title,
			summary: result.fill.summary,
			items: items.map(({ food, quantity }) => ({ food, quantity })),
			gap,
		},
	};
}

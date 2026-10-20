"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { limitReachedMessage } from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	getDiet,
	replaceMealFoods,
} from "~/domains/diet/services/diet-service";
import type { DietItem } from "~/domains/diet/types/diet-types";
import {
	allFoodsVisible,
	findVisibleFood,
} from "~/domains/food/services/food-service";
import { swapOptionsFor } from "~/domains/meal-recipe/services/recipe-swap-service";
import {
	isLightMeal,
	type RecipeSwap,
	swapQuantity,
	swapsFromCodes,
} from "~/domains/meal-recipe/utils/recipe-swap";
import {
	applyVariationInputSchema,
	type MealVariation,
	restoreVariationInputSchema,
	suggestVariationInputSchema,
} from "~/domains/meal-variation/schemas/meal-variation-schema";
import { suggestMealVariation } from "~/domains/meal-variation/services/meal-variation-service";

export type VariationResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const BETA_ONLY = "Recurso em teste, ainda não liberado pra sua conta.";
const MEAL_CHANGED = "Essa refeição mudou. Gere outra versão.";

async function betaUser() {
	const user = await getCurrentUser();
	return isBetaUser(user) ? user : null;
}

async function mealOf(userId: string, mealId: string) {
	const meals = await getDiet(userId, { createIfEmpty: false });
	return meals.find((meal) => meal.id === mealId) ?? null;
}

/**
 * Outra versão da refeição: o servidor calcula as trocas equivalentes (base
 * ampla + alimentos da pessoa) e a IA escolhe uma combinação que combine.
 */
export async function suggestVariationAction(
	input: unknown,
): Promise<VariationResult<MealVariation>> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = suggestVariationInputSchema.safeParse(input);
	if (!parsed.success) return fail("Refeição inválida.");

	const meal = await mealOf(user.id, parsed.data.mealId);
	if (!meal) return fail("Essa refeição não existe mais.");
	if (meal.items.length === 0) {
		return fail("Adicione alimentos à refeição primeiro.");
	}

	const items = await swapOptionsFor(user.id, meal.items, {
		sameGroup: false,
		limit: 8,
		withCustom: true,
		light: isLightMeal(meal),
	});
	if (items.every((item) => item.swaps.length === 0)) {
		return fail("Não achei trocas equivalentes pros alimentos dessa refeição.");
	}

	if (!(await consumeAiQuota(user.id, "meal-variation"))) {
		return fail(limitReachedMessage("meal-variation"));
	}
	const result = await suggestMealVariation(meal, items, parsed.data.avoid);
	if (!result.ok) {
		await refundAiQuota(user.id, "meal-variation");
		return result;
	}
	const swaps = swapsFromCodes(items, result.variation.swaps);
	if (swaps.length === 0) {
		await refundAiQuota(user.id, "meal-variation");
		return fail("Não achei uma boa troca pra essa refeição. Tente de novo.");
	}
	return {
		ok: true,
		data: {
			title: result.variation.title,
			summary: result.variation.summary,
			swaps,
		},
	};
}

/**
 * "Usar esta": confere cada troca de novo (alimento visível, macros quase
 * iguais), recalcula a quantidade e troca tudo numa transação.
 */
export async function applyVariationAction(
	input: unknown,
): Promise<VariationResult<{ items: Omit<DietItem, "options">[] }>> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = applyVariationInputSchema.safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");

	const meal = await mealOf(user.id, parsed.data.mealId);
	if (!meal) return fail(MEAL_CHANGED);

	const swaps: RecipeSwap[] = [];
	for (const { itemId, foodId } of parsed.data.swaps) {
		const item = meal.items.find((entry) => entry.id === itemId);
		const food = item ? await findVisibleFood(user.id, foodId) : null;
		const quantity = item && food ? swapQuantity(item, food) : null;
		if (!food || quantity === null) return fail(MEAL_CHANGED);
		swaps.push({ itemId, food, quantity });
	}
	const saved = await replaceMealFoods(
		user.id,
		meal.id,
		swaps.map(({ itemId, food, quantity }) => ({
			itemId,
			foodId: food.id,
			quantity,
		})),
	);
	if (!saved) return fail(MEAL_CHANGED);
	return {
		ok: true,
		data: {
			items: swaps.map(({ itemId, food, quantity }) => ({
				id: itemId,
				food,
				quantity,
			})),
		},
	};
}

/** "Desfazer": volta os alimentos e quantidades de antes da troca. */
export async function restoreVariationAction(
	input: unknown,
): Promise<VariationResult<null>> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = restoreVariationInputSchema.safeParse(input);
	if (!parsed.success) return fail("Não foi possível desfazer.");

	const { mealId, items } = parsed.data;
	const visible = await allFoodsVisible(
		user.id,
		items.map((item) => item.foodId),
	);
	if (!visible || !(await replaceMealFoods(user.id, mealId, items))) {
		return fail("Não foi possível desfazer.");
	}
	return { ok: true, data: null };
}

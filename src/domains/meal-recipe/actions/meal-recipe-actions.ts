"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { limitReachedMessage } from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import {
	type SuggestedRecipe,
	suggestRecipeInputSchema,
} from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import { suggestMealRecipe } from "~/domains/meal-recipe/services/meal-recipe-service";
import { findRecipePhoto } from "~/domains/meal-recipe/services/recipe-photo-service";
import { swapOptionsFor } from "~/domains/meal-recipe/services/recipe-swap-service";
import { safeExtras } from "~/domains/meal-recipe/utils/meal-recipe";
import {
	applySwaps,
	isLightMeal,
	swapsFromCodes,
} from "~/domains/meal-recipe/utils/recipe-swap";

export type SuggestRecipeActionResult =
	| { ok: true; data: SuggestedRecipe }
	| { ok: false; error: string };

/**
 * Receita com os alimentos da refeição (só os principais, sem as opções
 * "ou"). Os ingredientes mostrados vêm da dieta; da IA só saem os extras
 * (filtrados), o preparo e quais das trocas calculadas aqui ela usou.
 */
export async function suggestRecipeAction(
	input: unknown,
): Promise<SuggestRecipeActionResult> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) {
		return {
			ok: false,
			error: "Recurso em teste, ainda não liberado pra sua conta.",
		};
	}
	const parsed = suggestRecipeInputSchema.safeParse(input);
	if (!parsed.success) return { ok: false, error: "Refeição inválida." };

	const meals = await getDiet(user.id, { createIfEmpty: false });
	const meal = meals.find((entry) => entry.id === parsed.data.mealId);
	if (!meal) return { ok: false, error: "Essa refeição não existe mais." };
	if (meal.items.length === 0) {
		return { ok: false, error: "Adicione alimentos à refeição primeiro." };
	}

	if (!(await consumeAiQuota(user.id, "recipe"))) {
		return { ok: false, error: limitReachedMessage("recipe") };
	}
	const items = await swapOptionsFor(user.id, meal.items, {
		light: isLightMeal(meal),
	});
	const result = await suggestMealRecipe(meal, items, parsed.data.avoid);
	if (!result.ok) {
		await refundAiQuota(user.id, "recipe");
		return result;
	}
	const { imageQuery, swaps: codes, ...recipe } = result.recipe;
	const swaps = swapsFromCodes(items, codes);
	return {
		ok: true,
		data: {
			...recipe,
			extras: safeExtras(recipe.extras, [
				...meal.items,
				...applySwaps(meal.items, swaps),
			]),
			swaps,
			photo: await findRecipePhoto(imageQuery),
		},
	};
}

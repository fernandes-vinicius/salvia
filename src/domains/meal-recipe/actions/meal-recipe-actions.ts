"use server";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import {
	type MealRecipe,
	suggestRecipeInputSchema,
} from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import { suggestMealRecipe } from "~/domains/meal-recipe/services/meal-recipe-service";
import { safeExtras } from "~/domains/meal-recipe/utils/meal-recipe";

export type SuggestRecipeActionResult =
	| { ok: true; data: MealRecipe }
	| { ok: false; error: string };

/**
 * Receita com os alimentos da refeição (só os principais, sem as opções
 * "ou"). Os ingredientes mostrados vêm da dieta; da IA só saem os extras
 * (filtrados) e o preparo.
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

	const result = await suggestMealRecipe(meal.items, parsed.data.avoid);
	if (!result.ok) return result;
	return {
		ok: true,
		data: {
			...result.recipe,
			extras: safeExtras(result.recipe.extras, meal.items),
		},
	};
}

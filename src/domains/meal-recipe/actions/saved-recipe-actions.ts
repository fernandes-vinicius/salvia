"use server";

import { after } from "next/server";
import { z } from "zod";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import {
	restoreRecipeInputSchema,
	saveRecipeInputSchema,
} from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import { trackPhotoDownload } from "~/domains/meal-recipe/services/recipe-photo-service";
import {
	deleteRecipe,
	MAX_SAVED_RECIPES,
	restoreRecipe,
	saveRecipe,
} from "~/domains/meal-recipe/services/saved-recipe-service";
import type { SavedRecipe } from "~/domains/meal-recipe/types/saved-recipe-types";
import { safeExtras } from "~/domains/meal-recipe/utils/meal-recipe";
import { recipeSnapshot } from "~/domains/meal-recipe/utils/saved-recipe";

export type SavedRecipeResult<T = null> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const BETA_ONLY = "Recurso em teste, ainda não liberado pra sua conta.";

async function betaUser() {
	const user = await getCurrentUser();
	return isBetaUser(user) ? user : null;
}

/**
 * Salva a receita com a foto da refeição montada aqui, a partir da dieta
 * (ingredientes e macros não vêm do client).
 */
export async function saveRecipeAction(
	input: unknown,
): Promise<SavedRecipeResult<SavedRecipe>> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = saveRecipeInputSchema.safeParse(input);
	if (!parsed.success) return fail("Receita inválida.");

	const meals = await getDiet(user.id, { createIfEmpty: false });
	const meal = meals.find((entry) => entry.id === parsed.data.mealId);
	if (!meal || meal.items.length === 0) {
		return fail("Essa refeição mudou. Gere a receita de novo.");
	}

	const recipe = {
		...parsed.data.recipe,
		extras: safeExtras(parsed.data.recipe.extras, meal.items),
	};
	const saved = await saveRecipe(user.id, {
		mealId: meal.id,
		mealName: meal.name,
		recipe,
		snapshot: recipeSnapshot(meal.items),
	});
	// Regra da API do Unsplash: avisar quando a foto é usada (depois da
	// resposta, sem atrasar).
	const { photo } = recipe;
	if (photo && saved !== "full") after(() => trackPhotoDownload(photo));
	if (saved === "full") {
		return fail(
			`Você já tem ${MAX_SAVED_RECIPES} receitas salvas. Exclua algumas em Minhas receitas.`,
		);
	}
	return { ok: true, data: saved };
}

export async function deleteRecipeAction(
	recipeId: unknown,
): Promise<SavedRecipeResult> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = z.uuid().safeParse(recipeId);
	if (!parsed.success || !(await deleteRecipe(user.id, parsed.data))) {
		return fail("Essa receita não existe mais.");
	}
	return { ok: true, data: null };
}

/** "Desfazer" depois de excluir: recria igual (refeição só se ainda for sua). */
export async function restoreRecipeAction(
	input: unknown,
): Promise<SavedRecipeResult> {
	const user = await betaUser();
	if (!user) return fail(BETA_ONLY);
	const parsed = restoreRecipeInputSchema.safeParse(input);
	if (!parsed.success) return fail("Não foi possível desfazer.");

	const meals = await getDiet(user.id, { createIfEmpty: false });
	const mealId = meals.some((meal) => meal.id === parsed.data.mealId)
		? parsed.data.mealId
		: null;
	await restoreRecipe(user.id, { ...parsed.data, mealId });
	return { ok: true, data: null };
}

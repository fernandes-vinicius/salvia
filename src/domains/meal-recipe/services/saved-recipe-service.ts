import "server-only";

import { randomBytes } from "node:crypto";

import { and, count, desc, eq, isNotNull } from "drizzle-orm";

import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import type { SavedRecipe } from "~/domains/meal-recipe/types/saved-recipe-types";
import type { RecipeSnapshot } from "~/domains/meal-recipe/utils/saved-recipe";
import { db } from "~/shared/db";
import { savedRecipe } from "~/shared/db/schema";

export const MAX_SAVED_RECIPES = 100;

const columns = {
	id: savedRecipe.id,
	mealId: savedRecipe.mealId,
	mealName: savedRecipe.mealName,
	title: savedRecipe.title,
	summary: savedRecipe.summary,
	minutes: savedRecipe.minutes,
	extras: savedRecipe.extras,
	steps: savedRecipe.steps,
	tip: savedRecipe.tip,
	ingredients: savedRecipe.ingredients,
	macros: savedRecipe.macros,
	photo: savedRecipe.photo,
	shareToken: savedRecipe.shareToken,
	createdAt: savedRecipe.createdAt,
};

const toSaved = (
	row: Awaited<ReturnType<typeof listRows>>[number],
): SavedRecipe => ({
	id: row.id,
	mealId: row.mealId,
	mealName: row.mealName,
	title: row.title,
	summary: row.summary,
	minutes: row.minutes,
	extras: row.extras,
	steps: row.steps,
	tip: row.tip,
	ingredients: row.ingredients,
	macros: row.macros,
	photo: row.photo,
	shareToken: row.shareToken,
	createdAt: row.createdAt.toISOString(),
});

function listRows(userId: string) {
	return db
		.select(columns)
		.from(savedRecipe)
		.where(eq(savedRecipe.userId, userId))
		.orderBy(desc(savedRecipe.createdAt));
}

/** "Minhas receitas", da mais nova pra mais antiga. */
export async function listSavedRecipes(userId: string): Promise<SavedRecipe[]> {
	return (await listRows(userId)).map(toSaved);
}

/** Quantas receitas salvas cada refeição tem (pro menu ⋮ da Dieta). */
export async function countSavedByMeal(userId: string) {
	const rows = await db
		.select({ mealId: savedRecipe.mealId, total: count() })
		.from(savedRecipe)
		.where(and(eq(savedRecipe.userId, userId), isNotNull(savedRecipe.mealId)))
		.groupBy(savedRecipe.mealId);
	return Object.fromEntries(
		rows.map((row) => [row.mealId as string, row.total]),
	) as Record<string, number>;
}

export async function saveRecipe(
	userId: string,
	data: {
		mealId: string | null;
		mealName: string;
		recipe: MealRecipe;
		snapshot: RecipeSnapshot;
	},
): Promise<SavedRecipe | "full"> {
	const [{ total }] = await db
		.select({ total: count() })
		.from(savedRecipe)
		.where(eq(savedRecipe.userId, userId));
	if (total >= MAX_SAVED_RECIPES) return "full";

	const { recipe } = data;
	const [row] = await db
		.insert(savedRecipe)
		.values({
			userId,
			mealId: data.mealId,
			mealName: data.mealName,
			title: recipe.title,
			summary: recipe.summary,
			minutes: Math.round(recipe.minutes),
			extras: recipe.extras,
			steps: recipe.steps,
			tip: recipe.tip,
			ingredients: data.snapshot.ingredients,
			macros: data.snapshot.macros,
			photo: recipe.photo,
		})
		.returning();
	return toSaved(row);
}

/** Recria uma receita apagada ("Desfazer"), com o mesmo id e data. */
export async function restoreRecipe(userId: string, recipe: SavedRecipe) {
	await db
		.insert(savedRecipe)
		.values({
			...recipe,
			userId,
			createdAt: new Date(recipe.createdAt),
		})
		.onConflictDoNothing();
}

export async function deleteRecipe(userId: string, recipeId: string) {
	const rows = await db
		.delete(savedRecipe)
		.where(and(eq(savedRecipe.id, recipeId), eq(savedRecipe.userId, userId)))
		.returning({ id: savedRecipe.id });
	return rows.length > 0;
}

/** 16 caracteres url-safe (96 bits): impossível de adivinhar. */
const newToken = () => randomBytes(12).toString("base64url");

/** Liga o link público da receita (reaproveita o que já existe). */
export async function shareRecipe(userId: string, recipeId: string) {
	const owned = and(
		eq(savedRecipe.id, recipeId),
		eq(savedRecipe.userId, userId),
	);
	const [row] = await db
		.select({ token: savedRecipe.shareToken })
		.from(savedRecipe)
		.where(owned)
		.limit(1);
	if (!row) return null;
	if (row.token) return row.token;
	const token = newToken();
	await db.update(savedRecipe).set({ shareToken: token }).where(owned);
	return token;
}

/** Desliga o link (quem tiver o endereço vê "link não está mais ativo"). */
export async function unshareRecipe(userId: string, recipeId: string) {
	const rows = await db
		.update(savedRecipe)
		.set({ shareToken: null })
		.where(and(eq(savedRecipe.id, recipeId), eq(savedRecipe.userId, userId)))
		.returning({ id: savedRecipe.id });
	return rows.length > 0;
}

/** Receita pública do link; null se ele foi desativado ou a receita apagada. */
export async function getSharedRecipe(token: string) {
	const [row] = await db
		.select(columns)
		.from(savedRecipe)
		.where(eq(savedRecipe.shareToken, token))
		.limit(1);
	return row ? toSaved(row) : null;
}

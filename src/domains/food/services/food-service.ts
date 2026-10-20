import "server-only";

import {
	and,
	asc,
	countDistinct,
	eq,
	ilike,
	inArray,
	isNull,
	or,
	type SQL,
	sql,
} from "drizzle-orm";

import type { CustomFoodInput } from "~/domains/food/schemas/food-schema";
import type { CustomFoodSummary, Food } from "~/domains/food/types/food-types";
import { normalizeSearchText } from "~/domains/food/utils/food";
import { db } from "~/shared/db";
import { dietItem, food } from "~/shared/db/schema";

export const foodColumns = {
	id: food.id,
	source: food.source,
	name: food.name,
	category: food.category,
	unit: food.unit,
	protein: food.protein,
	carbs: food.carbs,
	fat: food.fat,
	fiber: food.fiber,
	sodium: food.sodium,
	iron: food.iron,
	proteinSource: food.proteinSource,
};

/** Alimentos visíveis pro usuário: TACO (globais) + os dele. */
function visibleTo(userId: string) {
	return or(isNull(food.userId), eq(food.userId, userId));
}

/**
 * Busca tolerante a acento: cada palavra digitada precisa aparecer no nome.
 * Ordem: alimentos do usuário, depois os que começam com o termo, depois os
 * nomes mais curtos (mais genéricos).
 */
export async function searchFoods(
	userId: string,
	query: string,
	limit = 30,
): Promise<Food[]> {
	const normalized = normalizeSearchText(query);
	const terms = normalized.split(" ").filter(Boolean);
	if (terms.length === 0) return [];

	const termFilters: SQL[] = terms.map((term) =>
		ilike(food.searchName, `%${term.replace(/[%_]/g, "")}%`),
	);

	return db
		.select(foodColumns)
		.from(food)
		.where(and(visibleTo(userId), ...termFilters))
		.orderBy(
			sql`${food.userId} is null`,
			sql`${food.searchName} like ${`${terms[0]}%`} desc`,
			sql`length(${food.name})`,
			asc(food.name),
		)
		.limit(limit);
}

export async function findVisibleFood(userId: string, foodId: string) {
	const [row] = await db
		.select(foodColumns)
		.from(food)
		.where(and(eq(food.id, foodId), visibleTo(userId)))
		.limit(1);
	return row ?? null;
}

/**
 * Base das trocas equivalentes: os alimentos da TACO com esses nomes e,
 * com `withCustom`, os cadastrados pelo próprio usuário.
 */
export async function foodsForSwaps(
	userId: string,
	names: string[],
	withCustom = false,
): Promise<Food[]> {
	const common = and(isNull(food.userId), inArray(food.name, names));
	return db
		.select(foodColumns)
		.from(food)
		.where(withCustom ? or(common, eq(food.userId, userId)) : common);
}

/** Todos os ids são de alimentos que o usuário pode usar? */
export async function allFoodsVisible(userId: string, foodIds: string[]) {
	const unique = [...new Set(foodIds)];
	if (unique.length === 0) return true;
	const rows = await db
		.select({ id: food.id })
		.from(food)
		.where(and(inArray(food.id, unique), visibleTo(userId)));
	return rows.length === unique.length;
}

export async function createCustomFood(
	userId: string,
	input: CustomFoodInput,
): Promise<Food> {
	const [row] = await db
		.insert(food)
		.values({
			userId,
			source: "custom",
			searchName: normalizeSearchText(input.name),
			...input,
		})
		.returning(foodColumns);
	return row;
}

/** Só alimentos cadastrados pelo próprio usuário (TACO não é editável). */
function ownedCustom(userId: string, foodId: string) {
	return and(
		eq(food.id, foodId),
		eq(food.userId, userId),
		eq(food.source, "custom"),
	);
}

export async function listCustomFoods(
	userId: string,
): Promise<CustomFoodSummary[]> {
	return db
		.select({ ...foodColumns, usedInMeals: countDistinct(dietItem.mealId) })
		.from(food)
		.leftJoin(dietItem, eq(dietItem.foodId, food.id))
		.where(and(eq(food.userId, userId), eq(food.source, "custom")))
		.groupBy(food.id)
		.orderBy(asc(food.name));
}

export async function updateCustomFood(
	userId: string,
	foodId: string,
	input: CustomFoodInput,
): Promise<Food | "not-found" | "unit-in-use"> {
	const [current] = await db
		.select({ unit: food.unit, usedInMeals: countDistinct(dietItem.mealId) })
		.from(food)
		.leftJoin(dietItem, eq(dietItem.foodId, food.id))
		.where(ownedCustom(userId, foodId))
		.groupBy(food.id);
	if (!current) return "not-found";
	// Mudar a unidade de um alimento em uso mudaria o sentido das quantidades
	// já salvas (100 g viraria 100 unidades).
	if (current.unit !== input.unit && current.usedInMeals > 0) {
		return "unit-in-use";
	}

	const [row] = await db
		.update(food)
		.set({ ...input, searchName: normalizeSearchText(input.name) })
		.where(ownedCustom(userId, foodId))
		.returning(foodColumns);
	return row ?? "not-found";
}

/** Exclui o alimento; os itens da dieta que o usam saem junto (cascade). */
export async function deleteCustomFood(userId: string, foodId: string) {
	const rows = await db
		.delete(food)
		.where(ownedCustom(userId, foodId))
		.returning({ id: food.id });
	return rows.length > 0;
}

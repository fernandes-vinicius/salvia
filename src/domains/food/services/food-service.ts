import "server-only";

import { and, asc, eq, ilike, isNull, or, type SQL, sql } from "drizzle-orm";

import type { CustomFoodInput } from "~/domains/food/schemas/food-schema";
import type { Food } from "~/domains/food/types/food-types";
import { normalizeSearchText } from "~/domains/food/utils/food";
import { db } from "~/shared/db";
import { food } from "~/shared/db/schema";

export const foodColumns = {
	id: food.id,
	source: food.source,
	name: food.name,
	category: food.category,
	unit: food.unit,
	protein: food.protein,
	carbs: food.carbs,
	fat: food.fat,
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

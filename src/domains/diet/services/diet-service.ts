import "server-only";

import { and, asc, count, eq, inArray } from "drizzle-orm";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { foodColumns } from "~/domains/food/services/food-service";
import { db } from "~/shared/db";
import { dietItem, dietMeal, food } from "~/shared/db/schema";

const INITIAL_MEALS = 3;

/** Plano do usuário; cria as 3 refeições em branco na primeira visita. */
export async function getDiet(userId: string): Promise<DietMeal[]> {
	let meals = await db
		.select({ id: dietMeal.id, name: dietMeal.name, time: dietMeal.time })
		.from(dietMeal)
		.where(eq(dietMeal.userId, userId))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));

	if (meals.length === 0) {
		meals = await db
			.insert(dietMeal)
			.values(
				Array.from({ length: INITIAL_MEALS }, (_, index) => ({
					userId,
					name: `Refeição ${index + 1}`,
					position: index,
				})),
			)
			.returning({ id: dietMeal.id, name: dietMeal.name, time: dietMeal.time });
	}

	const items = await db
		.select({
			id: dietItem.id,
			mealId: dietItem.mealId,
			quantity: dietItem.quantity,
			food: foodColumns,
		})
		.from(dietItem)
		.innerJoin(food, eq(food.id, dietItem.foodId))
		.where(
			inArray(
				dietItem.mealId,
				meals.map((meal) => meal.id),
			),
		)
		.orderBy(asc(dietItem.position), asc(dietItem.createdAt));

	return meals.map((meal) => ({
		...meal,
		items: items
			.filter((item) => item.mealId === meal.id)
			.map(({ mealId: _, ...item }) => item),
	}));
}

async function ownedMeal(userId: string, mealId: string) {
	const [meal] = await db
		.select({ id: dietMeal.id, position: dietMeal.position })
		.from(dietMeal)
		.where(and(eq(dietMeal.id, mealId), eq(dietMeal.userId, userId)))
		.limit(1);
	return meal ?? null;
}

async function ownedItem(userId: string, itemId: string) {
	const [item] = await db
		.select({ id: dietItem.id })
		.from(dietItem)
		.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
		.where(and(eq(dietItem.id, itemId), eq(dietMeal.userId, userId)))
		.limit(1);
	return item ?? null;
}

async function mealPositions(userId: string) {
	return db
		.select({ id: dietMeal.id, position: dietMeal.position })
		.from(dietMeal)
		.where(eq(dietMeal.userId, userId))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));
}

export async function addMeal(userId: string, name: string) {
	const positions = await mealPositions(userId);
	const last = positions.at(-1);
	const [meal] = await db
		.insert(dietMeal)
		.values({ userId, name, position: (last?.position ?? -1) + 1 })
		.returning({ id: dietMeal.id, name: dietMeal.name, time: dietMeal.time });
	return { ...meal, items: [] } satisfies DietMeal;
}

export async function updateMeal(
	userId: string,
	mealId: string,
	data: { name: string; time: string | null },
) {
	if (!(await ownedMeal(userId, mealId))) return false;
	await db.update(dietMeal).set(data).where(eq(dietMeal.id, mealId));
	return true;
}

/** Reescreve as posições na ordem recebida (só ids do próprio usuário). */
export async function reorderMeals(userId: string, orderedIds: string[]) {
	const current = await mealPositions(userId);
	const owned = new Set(current.map((meal) => meal.id));
	if (
		orderedIds.length !== current.length ||
		!orderedIds.every((id) => owned.has(id))
	) {
		return false;
	}
	await db.transaction(async (tx) => {
		for (const [position, id] of orderedIds.entries()) {
			await tx.update(dietMeal).set({ position }).where(eq(dietMeal.id, id));
		}
	});
	return true;
}

/** Remove a refeição (e seus itens); mantém ao menos uma. */
export async function deleteMeal(
	userId: string,
	mealId: string,
): Promise<"deleted" | "not-found" | "last-meal"> {
	if (!(await ownedMeal(userId, mealId))) return "not-found";
	const [{ total }] = await db
		.select({ total: count() })
		.from(dietMeal)
		.where(eq(dietMeal.userId, userId));
	if (total <= 1) return "last-meal";
	await db.delete(dietMeal).where(eq(dietMeal.id, mealId));
	return "deleted";
}

export async function addItem(
	userId: string,
	mealId: string,
	foodId: string,
	quantity: number,
) {
	if (!(await ownedMeal(userId, mealId))) return null;
	const [{ total }] = await db
		.select({ total: count() })
		.from(dietItem)
		.where(eq(dietItem.mealId, mealId));
	const [row] = await db
		.insert(dietItem)
		.values({ mealId, foodId, quantity, position: total })
		.returning({ id: dietItem.id, quantity: dietItem.quantity });
	return row;
}

export async function updateItemQuantity(
	userId: string,
	itemId: string,
	quantity: number,
) {
	if (!(await ownedItem(userId, itemId))) return false;
	await db.update(dietItem).set({ quantity }).where(eq(dietItem.id, itemId));
	return true;
}

export async function deleteItem(userId: string, itemId: string) {
	if (!(await ownedItem(userId, itemId))) return false;
	await db.delete(dietItem).where(eq(dietItem.id, itemId));
	return true;
}

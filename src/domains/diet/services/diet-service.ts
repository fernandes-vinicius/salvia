import "server-only";

import { and, asc, count, eq, gte, inArray, max, sql } from "drizzle-orm";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { foodColumns } from "~/domains/food/services/food-service";
import { db } from "~/shared/db";
import { dietItem, dietMeal, food } from "~/shared/db/schema";

const INITIAL_MEALS = 3;

/**
 * Plano do usuário. Por padrão cria as 3 refeições em branco na primeira
 * visita (aba Dieta); `createIfEmpty: false` só lê (ex.: Início).
 */
export async function getDiet(
	userId: string,
	{ createIfEmpty = true }: { createIfEmpty?: boolean } = {},
): Promise<DietMeal[]> {
	let meals = await db
		.select({ id: dietMeal.id, name: dietMeal.name, time: dietMeal.time })
		.from(dietMeal)
		.where(eq(dietMeal.userId, userId))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));

	if (meals.length === 0 && createIfEmpty) {
		meals = await insertInitialMeals(db, userId);
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

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** As 3 refeições em branco do começo ("Refeição 1–3"). */
function insertInitialMeals(executor: typeof db | Tx, userId: string) {
	return executor
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

/**
 * Volta a dieta ao estado inicial: apaga todas as refeições (os itens vão
 * junto, cascade) e recria as 3 em branco, tudo numa transação.
 */
export async function resetDiet(userId: string): Promise<DietMeal[]> {
	const meals = await db.transaction(async (tx) => {
		await tx.delete(dietMeal).where(eq(dietMeal.userId, userId));
		return insertInitialMeals(tx, userId);
	});
	return meals.map((meal) => ({ ...meal, items: [] }));
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

/**
 * Adiciona um item no fim da refeição ou, com `index`, numa posição exata
 * (ex.: "Desfazer" depois de remover), empurrando os seguintes.
 */
export async function addItem(
	userId: string,
	mealId: string,
	foodId: string,
	quantity: number,
	index?: number,
) {
	if (!(await ownedMeal(userId, mealId))) return null;

	return db.transaction(async (tx) => {
		let position: number;
		if (index === undefined) {
			const [{ last }] = await tx
				.select({ last: max(dietItem.position) })
				.from(dietItem)
				.where(eq(dietItem.mealId, mealId));
			position = (last ?? -1) + 1;
		} else {
			position = index;
			await tx
				.update(dietItem)
				.set({ position: sql`${dietItem.position} + 1` })
				.where(and(eq(dietItem.mealId, mealId), gte(dietItem.position, index)));
		}

		const [row] = await tx
			.insert(dietItem)
			.values({ mealId, foodId, quantity, position })
			.returning({ id: dietItem.id, quantity: dietItem.quantity });
		return row;
	});
}

export interface MealLayout {
	mealId: string;
	itemIds: string[];
}

/**
 * Grava a ordem (e a refeição) dos itens depois de arrastar: cada item vai
 * pra `mealId` na posição do array. Só aceita refeições e itens do usuário.
 */
export async function placeItems(userId: string, layout: MealLayout[]) {
	const mealIds = layout.map((entry) => entry.mealId);
	const itemIds = layout.flatMap((entry) => entry.itemIds);
	if (new Set(itemIds).size !== itemIds.length) return false;

	const ownedMeals = await db
		.select({ id: dietMeal.id })
		.from(dietMeal)
		.where(and(eq(dietMeal.userId, userId), inArray(dietMeal.id, mealIds)));
	if (ownedMeals.length !== new Set(mealIds).size) return false;

	if (itemIds.length > 0) {
		const ownedItems = await db
			.select({ id: dietItem.id })
			.from(dietItem)
			.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
			.where(and(eq(dietMeal.userId, userId), inArray(dietItem.id, itemIds)));
		if (ownedItems.length !== itemIds.length) return false;
	}

	await db.transaction(async (tx) => {
		for (const { mealId, itemIds: ids } of layout) {
			for (const [position, id] of ids.entries()) {
				await tx
					.update(dietItem)
					.set({ mealId, position })
					.where(eq(dietItem.id, id));
			}
		}
	});
	return true;
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

/** Troca o alimento do item mantendo a posição na refeição. */
export async function replaceItemFood(
	userId: string,
	itemId: string,
	foodId: string,
	quantity: number,
) {
	if (!(await ownedItem(userId, itemId))) return false;
	await db
		.update(dietItem)
		.set({ foodId, quantity })
		.where(eq(dietItem.id, itemId));
	return true;
}

export async function deleteItem(userId: string, itemId: string) {
	if (!(await ownedItem(userId, itemId))) return false;
	await db.delete(dietItem).where(eq(dietItem.id, itemId));
	return true;
}

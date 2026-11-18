import "server-only";

import { and, asc, count, eq, gte, inArray, max, sql } from "drizzle-orm";

import type {
	DietItemOption,
	DietMeal,
	DietVariant,
} from "~/domains/diet/types/diet-types";
import { MAX_ITEM_OPTIONS } from "~/domains/diet/utils/diet";
import { applyPlan } from "~/domains/diet/utils/diet-draft";
import { foodColumns } from "~/domains/food/services/food-service";
import { db } from "~/shared/db";
import {
	dietItem,
	dietItemOption,
	dietMeal,
	dietSupplement,
	food,
} from "~/shared/db/schema";

const INITIAL_MEALS = 3;

/**
 * Plano do usuário. Por padrão cria as 3 refeições em branco na primeira
 * visita (aba Dieta); `createIfEmpty: false` só lê (ex.: Início). `variant`
 * lê o rascunho ou a versão anterior em vez da dieta que vale.
 */
export async function getDiet(
	userId: string,
	{
		createIfEmpty = true,
		variant = "active",
	}: { createIfEmpty?: boolean; variant?: DietVariant } = {},
): Promise<DietMeal[]> {
	let meals: {
		id: string;
		name: string;
		time: string | null;
		sourceMealId?: string | null;
	}[] = await db
		.select({
			id: dietMeal.id,
			name: dietMeal.name,
			time: dietMeal.time,
			sourceMealId: dietMeal.sourceMealId,
		})
		.from(dietMeal)
		.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, variant)))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));

	if (meals.length === 0 && createIfEmpty && variant === "active") {
		meals = await insertInitialMeals(db, userId);
	}
	// A origem só interessa nas cópias (rascunho e anterior).
	if (variant === "active") {
		meals = meals.map(({ sourceMealId: _, ...meal }) => meal);
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

	const options = await listOptions(items.map((item) => item.id));

	return meals.map((meal) => ({
		...meal,
		items: items
			.filter((item) => item.mealId === meal.id)
			.map(({ mealId: _, ...item }) => ({
				...item,
				options: options.get(item.id) ?? [],
			})),
	}));
}

/**
 * A dieta (atual ou rascunho) que contém a refeição: os recursos de IA
 * funcionam nas duas. Sem a refeição, a dieta atual.
 */
export async function getDietOfMeal(userId: string, mealId: string) {
	const meal = await ownedMeal(userId, mealId);
	return getDiet(userId, {
		createIfEmpty: false,
		variant: meal?.variant ?? "active",
	});
}

/** A dieta (atual ou rascunho) que contém o item. */
export async function getDietOfItem(userId: string, itemId: string) {
	const [row] = await db
		.select({ variant: dietMeal.variant })
		.from(dietItem)
		.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
		.where(and(eq(dietItem.id, itemId), eq(dietMeal.userId, userId)))
		.limit(1);
	return getDiet(userId, {
		createIfEmpty: false,
		variant: row?.variant ?? "active",
	});
}

/** Opções dos itens, agrupadas pelo item e na ordem em que foram criadas. */
async function listOptions(itemIds: string[]) {
	const grouped = new Map<string, DietItemOption[]>();
	if (itemIds.length === 0) return grouped;
	const rows = await db
		.select({
			id: dietItemOption.id,
			itemId: dietItemOption.itemId,
			quantity: dietItemOption.quantity,
			food: foodColumns,
		})
		.from(dietItemOption)
		.innerJoin(food, eq(food.id, dietItemOption.foodId))
		.where(inArray(dietItemOption.itemId, itemIds))
		.orderBy(asc(dietItemOption.position), asc(dietItemOption.createdAt));
	for (const { itemId, ...option } of rows) {
		grouped.set(itemId, [...(grouped.get(itemId) ?? []), option]);
	}
	return grouped;
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
 * junto, cascade) e a suplementação, e recria as 3 em branco, tudo numa
 * transação.
 */
export async function resetDiet(userId: string): Promise<DietMeal[]> {
	const meals = await db.transaction(async (tx) => {
		await tx.delete(dietMeal).where(eq(dietMeal.userId, userId));
		await tx.delete(dietSupplement).where(eq(dietSupplement.userId, userId));
		return insertInitialMeals(tx, userId);
	});
	return meals.map((meal) => ({ ...meal, items: [] }));
}

export interface NewDietMeal {
	name: string;
	time: string | null;
	items: { foodId: string; quantity: number; options: NewOption[] }[];
}

/**
 * Troca a dieta inteira (ex.: importada de um documento), numa transação:
 * apaga as refeições atuais (itens e opções vão junto, cascade) e grava as
 * novas. Os alimentos já precisam ter sido checados. O rascunho e a versão
 * anterior ficam (só perdem a ligação com as refeições apagadas).
 */
export async function replaceDiet(userId: string, meals: NewDietMeal[]) {
	await db.transaction(async (tx) => {
		await tx
			.delete(dietMeal)
			.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, "active")));
		for (const [position, meal] of meals.entries()) {
			const [row] = await tx
				.insert(dietMeal)
				.values({ userId, name: meal.name, time: meal.time, position })
				.returning({ id: dietMeal.id });
			for (const [index, item] of meal.items.entries()) {
				const [itemRow] = await tx
					.insert(dietItem)
					.values({
						mealId: row.id,
						foodId: item.foodId,
						quantity: item.quantity,
						position: index,
					})
					.returning({ id: dietItem.id });
				if (item.options.length === 0) continue;
				await tx.insert(dietItemOption).values(
					item.options.map((option, optionIndex) => ({
						itemId: itemRow.id,
						foodId: option.foodId,
						quantity: option.quantity,
						position: optionIndex,
					})),
				);
			}
		}
	});
}

async function ownedMeal(userId: string, mealId: string) {
	const [meal] = await db
		.select({
			id: dietMeal.id,
			position: dietMeal.position,
			variant: dietMeal.variant,
		})
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

async function mealPositions(userId: string, variant: DietVariant) {
	return db
		.select({ id: dietMeal.id, position: dietMeal.position })
		.from(dietMeal)
		.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, variant)))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));
}

/**
 * Nova ordem das refeições ("Reordenar refeições"). Precisa ter exatamente
 * as refeições do usuário; senão, a lista mudou em outra aba.
 */
export async function reorderMeals(userId: string, mealIds: string[]) {
	const first = await ownedMeal(userId, mealIds[0]);
	if (!first) return false;
	const current = await mealPositions(userId, first.variant);
	const known = new Set(current.map((meal) => meal.id));
	if (
		mealIds.length !== current.length ||
		new Set(mealIds).size !== mealIds.length ||
		!mealIds.every((id) => known.has(id))
	) {
		return false;
	}
	await db.transaction(async (tx) => {
		for (const [position, id] of mealIds.entries()) {
			await tx.update(dietMeal).set({ position }).where(eq(dietMeal.id, id));
		}
	});
	return true;
}

export async function addMeal(
	userId: string,
	name: string,
	variant: "active" | "draft" = "active",
) {
	const positions = await mealPositions(userId, variant);
	const last = positions.at(-1);
	const [meal] = await db
		.insert(dietMeal)
		.values({ userId, name, variant, position: (last?.position ?? -1) + 1 })
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
	const meal = await ownedMeal(userId, mealId);
	if (!meal) return "not-found";
	const [{ total }] = await db
		.select({ total: count() })
		.from(dietMeal)
		.where(
			and(eq(dietMeal.userId, userId), eq(dietMeal.variant, meal.variant)),
		);
	if (total <= 1) return "last-meal";
	await db.delete(dietMeal).where(eq(dietMeal.id, mealId));
	return "deleted";
}

export interface NewOption {
	foodId: string;
	quantity: number;
}

/**
 * Adiciona um item no fim da refeição ou, com `index`, numa posição exata
 * (ex.: "Desfazer" depois de remover), empurrando os seguintes. `options`
 * recria as opções junto (copiar pra outra refeição, desfazer).
 */
export async function addItem(
	userId: string,
	mealId: string,
	foodId: string,
	quantity: number,
	index?: number,
	options: NewOption[] = [],
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
		const optionRows =
			options.length > 0
				? await tx
						.insert(dietItemOption)
						.values(
							options.map((option, optionIndex) => ({
								itemId: row.id,
								foodId: option.foodId,
								quantity: option.quantity,
								position: optionIndex,
							})),
						)
						.returning({ id: dietItemOption.id })
				: [];
		return { ...row, optionIds: optionRows.map((option) => option.id) };
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
		.select({ id: dietMeal.id, variant: dietMeal.variant })
		.from(dietMeal)
		.where(and(eq(dietMeal.userId, userId), inArray(dietMeal.id, mealIds)));
	if (ownedMeals.length !== new Set(mealIds).size) return false;
	// Nada passa entre a dieta e o rascunho.
	const variant = ownedMeals[0]?.variant;
	if (ownedMeals.some((meal) => meal.variant !== variant)) return false;

	if (itemIds.length > 0) {
		const ownedItems = await db
			.select({ id: dietItem.id })
			.from(dietItem)
			.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
			.where(
				and(
					eq(dietMeal.userId, userId),
					eq(dietMeal.variant, variant),
					inArray(dietItem.id, itemIds),
				),
			);
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

/**
 * Troca o alimento de vários itens da mesma refeição de uma vez (variar
 * refeição e o "Desfazer" dela). Falha se algum item não for da refeição.
 */
export async function replaceMealFoods(
	userId: string,
	mealId: string,
	changes: { itemId: string; foodId: string; quantity: number }[],
) {
	const ids = changes.map((change) => change.itemId);
	if (ids.length === 0) return false;
	const owned = await db
		.select({ id: dietItem.id })
		.from(dietItem)
		.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
		.where(
			and(
				inArray(dietItem.id, ids),
				eq(dietMeal.id, mealId),
				eq(dietMeal.userId, userId),
			),
		);
	if (owned.length !== new Set(ids).size) return false;
	await db.transaction(async (tx) => {
		for (const { itemId, foodId, quantity } of changes) {
			await tx
				.update(dietItem)
				.set({ foodId, quantity })
				.where(eq(dietItem.id, itemId));
		}
	});
	return true;
}

export async function deleteItem(userId: string, itemId: string) {
	if (!(await ownedItem(userId, itemId))) return false;
	await db.delete(dietItem).where(eq(dietItem.id, itemId));
	return true;
}

// --- Opções do item ---------------------------------------------------------

async function ownedOption(userId: string, optionId: string) {
	const [option] = await db
		.select({
			id: dietItemOption.id,
			itemId: dietItemOption.itemId,
			foodId: dietItemOption.foodId,
			quantity: dietItemOption.quantity,
		})
		.from(dietItemOption)
		.innerJoin(dietItem, eq(dietItem.id, dietItemOption.itemId))
		.innerJoin(dietMeal, eq(dietMeal.id, dietItem.mealId))
		.where(and(eq(dietItemOption.id, optionId), eq(dietMeal.userId, userId)))
		.limit(1);
	return option ?? null;
}

/** Nova opção no fim da lista do item (até `MAX_ITEM_OPTIONS`). */
export async function addItemOption(
	userId: string,
	itemId: string,
	foodId: string,
	quantity: number,
): Promise<{ id: string; quantity: number } | "not-found" | "full"> {
	if (!(await ownedItem(userId, itemId))) return "not-found";
	const [{ total, last }] = await db
		.select({ total: count(), last: max(dietItemOption.position) })
		.from(dietItemOption)
		.where(eq(dietItemOption.itemId, itemId));
	if (total >= MAX_ITEM_OPTIONS) return "full";
	const [row] = await db
		.insert(dietItemOption)
		.values({ itemId, foodId, quantity, position: (last ?? -1) + 1 })
		.returning({ id: dietItemOption.id, quantity: dietItemOption.quantity });
	return row;
}

export async function deleteItemOption(userId: string, optionId: string) {
	if (!(await ownedOption(userId, optionId))) return false;
	await db.delete(dietItemOption).where(eq(dietItemOption.id, optionId));
	return true;
}

/**
 * "Usar esta": a opção vira o alimento do item e o alimento de antes vira a
 * opção, no mesmo lugar (desfazer = trocar de novo).
 */
export async function swapItemOption(userId: string, optionId: string) {
	const option = await ownedOption(userId, optionId);
	if (!option) return false;
	await db.transaction(async (tx) => {
		const [item] = await tx
			.select({ foodId: dietItem.foodId, quantity: dietItem.quantity })
			.from(dietItem)
			.where(eq(dietItem.id, option.itemId));
		await tx
			.update(dietItem)
			.set({ foodId: option.foodId, quantity: option.quantity })
			.where(eq(dietItem.id, option.itemId));
		await tx
			.update(dietItemOption)
			.set({ foodId: item.foodId, quantity: item.quantity })
			.where(eq(dietItemOption.id, optionId));
	});
	return true;
}

// --- Rascunho e versão anterior ---------------------------------------------

/** Quais versões além da atual a pessoa tem (rascunho, anterior). */
export async function dietVariants(userId: string) {
	const rows = await db
		.selectDistinct({ variant: dietMeal.variant })
		.from(dietMeal)
		.where(
			and(
				eq(dietMeal.userId, userId),
				inArray(dietMeal.variant, ["draft", "previous"]),
			),
		);
	const found = new Set(rows.map((row) => row.variant));
	return { draft: found.has("draft"), previous: found.has("previous") };
}

/**
 * Copia a dieta que vale pra `to` (rascunho ou anterior), apagando o que
 * houver lá: refeições com a origem, itens e opções.
 */
async function copyActive(tx: Tx, userId: string, to: "draft" | "previous") {
	await tx
		.delete(dietMeal)
		.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, to)));
	const meals = await tx
		.select({
			id: dietMeal.id,
			name: dietMeal.name,
			time: dietMeal.time,
			position: dietMeal.position,
		})
		.from(dietMeal)
		.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, "active")))
		.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));
	if (meals.length === 0) return;

	const items = await tx
		.select({
			id: dietItem.id,
			mealId: dietItem.mealId,
			foodId: dietItem.foodId,
			quantity: dietItem.quantity,
			position: dietItem.position,
		})
		.from(dietItem)
		.where(
			inArray(
				dietItem.mealId,
				meals.map((meal) => meal.id),
			),
		);
	const options =
		items.length > 0
			? await tx
					.select({
						itemId: dietItemOption.itemId,
						foodId: dietItemOption.foodId,
						quantity: dietItemOption.quantity,
						position: dietItemOption.position,
					})
					.from(dietItemOption)
					.where(
						inArray(
							dietItemOption.itemId,
							items.map((item) => item.id),
						),
					)
			: [];

	for (const meal of meals) {
		const [copy] = await tx
			.insert(dietMeal)
			.values({
				userId,
				name: meal.name,
				time: meal.time,
				position: meal.position,
				variant: to,
				sourceMealId: meal.id,
			})
			.returning({ id: dietMeal.id });
		for (const item of items.filter((entry) => entry.mealId === meal.id)) {
			const [itemCopy] = await tx
				.insert(dietItem)
				.values({
					mealId: copy.id,
					foodId: item.foodId,
					quantity: item.quantity,
					position: item.position,
				})
				.returning({ id: dietItem.id });
			const itemOptions = options.filter((option) => option.itemId === item.id);
			if (itemOptions.length === 0) continue;
			await tx.insert(dietItemOption).values(
				itemOptions.map((option) => ({
					itemId: itemCopy.id,
					foodId: option.foodId,
					quantity: option.quantity,
					position: option.position,
				})),
			);
		}
	}
}

/** Cria o rascunho como cópia da dieta (se já existe, continua o mesmo). */
export async function startDraft(userId: string) {
	await db.transaction(async (tx) => {
		const [existing] = await tx
			.select({ id: dietMeal.id })
			.from(dietMeal)
			.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, "draft")))
			.limit(1);
		if (!existing) await copyActive(tx, userId, "draft");
	});
}

/** Apaga o rascunho ou a versão anterior. */
export async function discardVariant(
	userId: string,
	variant: "draft" | "previous",
) {
	await db
		.delete(dietMeal)
		.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, variant)));
}

/**
 * Faz o rascunho (ou a versão anterior) virar a dieta, numa transação. As
 * refeições que continuam são atualizadas no lugar (`applyPlan`): os itens do
 * rascunho passam pra elas e o check-in, os suplementos e as receitas ligados
 * seguem valendo. Com `keepPrevious`, a dieta de antes vira a versão anterior.
 * Devolve false se não houver o que usar.
 */
export async function applyVariant(
	userId: string,
	variant: "draft" | "previous",
	{ keepPrevious = false }: { keepPrevious?: boolean } = {},
) {
	return db.transaction(async (tx) => {
		const meals = await tx
			.select({
				id: dietMeal.id,
				name: dietMeal.name,
				time: dietMeal.time,
				sourceMealId: dietMeal.sourceMealId,
			})
			.from(dietMeal)
			.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, variant)))
			.orderBy(asc(dietMeal.position), asc(dietMeal.createdAt));
		if (meals.length === 0) return false;

		if (variant === "draft" && keepPrevious) {
			await copyActive(tx, userId, "previous");
		}
		const active = await tx
			.select({ id: dietMeal.id })
			.from(dietMeal)
			.where(and(eq(dietMeal.userId, userId), eq(dietMeal.variant, "active")));
		const plan = applyPlan(
			active.map((meal) => meal.id),
			meals,
		);

		if (plan.remove.length > 0) {
			await tx.delete(dietMeal).where(inArray(dietMeal.id, plan.remove));
		}
		for (const { from, into, position } of plan.update) {
			const meal = meals.find((entry) => entry.id === from);
			if (!meal) continue;
			await tx
				.update(dietMeal)
				.set({ name: meal.name, time: meal.time, position })
				.where(eq(dietMeal.id, into));
			await tx.delete(dietItem).where(eq(dietItem.mealId, into));
			// Os itens (com as opções) mudam de refeição, sem copiar.
			await tx
				.update(dietItem)
				.set({ mealId: into })
				.where(eq(dietItem.mealId, from));
			await tx.delete(dietMeal).where(eq(dietMeal.id, from));
		}
		for (const { id, position } of plan.promote) {
			await tx
				.update(dietMeal)
				.set({ variant: "active", sourceMealId: null, position })
				.where(eq(dietMeal.id, id));
		}
		return true;
	});
}

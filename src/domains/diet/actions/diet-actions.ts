"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	addItem,
	addItemOption,
	addMeal,
	deleteItem,
	deleteItemOption,
	deleteMeal,
	placeItems,
	reorderMeals,
	replaceItemFood,
	resetDiet,
	swapItemOption,
	updateItemQuantity,
	updateMeal,
} from "~/domains/diet/services/diet-service";
import type {
	DietItem,
	DietItemOption,
	DietMeal,
} from "~/domains/diet/types/diet-types";
import { MAX_ITEM_OPTIONS } from "~/domains/diet/utils/diet";
import { findVisibleFood } from "~/domains/food/services/food-service";
import type { Food } from "~/domains/food/types/food-types";

export type ActionResult<T = null> =
	| { ok: true; data: T }
	/** `stale`: a refeição/item não existe mais (mudou em outra aba ou aparelho). */
	| { ok: false; error: string; stale?: boolean };

const id = z.uuid();
const quantity = z.number().positive().max(5000);
const mealData = z.object({
	name: z.string().trim().min(1, "Dê um nome à refeição.").max(40),
	time: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/)
		.nullable(),
});

const fail = (error: string) => ({ ok: false as const, error });
const stale = (error: string) => ({ ok: false as const, error, stale: true });
const done = <T>(data: T) => ({ ok: true as const, data });

export async function addMealAction(
	name: unknown,
): Promise<ActionResult<DietMeal>> {
	const user = await getCurrentUser();
	const parsed = mealData.shape.name.safeParse(name);
	if (!parsed.success) return fail("Nome inválido.");
	return done(await addMeal(user.id, parsed.data));
}

export async function updateMealAction(
	mealId: unknown,
	data: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsedId = id.safeParse(mealId);
	const parsed = mealData.safeParse(data);
	if (!parsedId.success || !parsed.success) {
		return fail(parsed.error?.issues[0]?.message ?? "Dados inválidos.");
	}
	return (await updateMeal(user.id, parsedId.data, parsed.data))
		? done(null)
		: stale("Refeição não encontrada.");
}

export async function deleteMealAction(mealId: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(mealId);
	if (!parsed.success) return fail("Refeição inválida.");
	const status = await deleteMeal(user.id, parsed.data);
	if (status === "not-found") return stale("Refeição não encontrada.");
	if (status === "last-meal") return fail("Mantenha pelo menos uma refeição.");
	return done(null);
}

export async function addItemAction(
	input: unknown,
): Promise<ActionResult<DietItem>> {
	const user = await getCurrentUser();
	const parsed = z
		.object({
			mealId: id,
			foodId: id,
			quantity,
			// Posição exata (usada pelo "Desfazer"); sem ela, vai pro fim.
			index: z.number().int().min(0).optional(),
			// Opções recriadas junto (copiar pra outra refeição, desfazer).
			options: z
				.array(z.object({ foodId: id, quantity }))
				.max(MAX_ITEM_OPTIONS)
				.default([]),
		})
		.safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");

	const food = await findVisibleFood(user.id, parsed.data.foodId);
	if (!food) return fail("Alimento não encontrado.");
	const optionFoods: Food[] = [];
	for (const option of parsed.data.options) {
		const optionFood = await findVisibleFood(user.id, option.foodId);
		if (!optionFood) return fail("Alimento não encontrado.");
		optionFoods.push(optionFood);
	}

	const row = await addItem(
		user.id,
		parsed.data.mealId,
		food.id,
		parsed.data.quantity,
		parsed.data.index,
		parsed.data.options,
	);
	if (!row) return stale("Refeição não encontrada.");
	const { optionIds, ...item } = row;
	return done({
		...item,
		food,
		options: optionIds.map((optionId, index) => ({
			id: optionId,
			quantity: parsed.data.options[index].quantity,
			food: optionFoods[index],
		})),
	});
}

export async function updateItemQuantityAction(
	itemId: unknown,
	value: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsedId = id.safeParse(itemId);
	const parsed = quantity.safeParse(value);
	if (!parsedId.success || !parsed.success) return fail("Quantidade inválida.");
	return (await updateItemQuantity(user.id, parsedId.data, parsed.data))
		? done(null)
		: stale("Alimento não encontrado.");
}

/**
 * Substitui o alimento do item (mesma posição); devolve o item atualizado
 * (as opções continuam as mesmas).
 */
export async function replaceItemFoodAction(
	input: unknown,
): Promise<ActionResult<Omit<DietItem, "options">>> {
	const user = await getCurrentUser();
	const parsed = z
		.object({ itemId: id, foodId: id, quantity })
		.safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");

	const food = await findVisibleFood(user.id, parsed.data.foodId);
	if (!food) return fail("Alimento não encontrado.");

	const { itemId, quantity: value } = parsed.data;
	return (await replaceItemFood(user.id, itemId, food.id, value))
		? done({ id: itemId, quantity: value, food })
		: stale("Alimento não encontrado.");
}

export async function deleteItemAction(itemId: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(itemId);
	if (!parsed.success) return fail("Alimento inválido.");
	return (await deleteItem(user.id, parsed.data))
		? done(null)
		: stale("Alimento não encontrado.");
}

/** Nova ordem dos itens nas refeições afetadas por um arrastar e soltar. */
export async function placeItemsAction(layout: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = z
		.array(z.object({ mealId: id, itemIds: z.array(id) }))
		.min(1)
		.safeParse(layout);
	if (!parsed.success) return fail("Ordem inválida.");
	return (await placeItems(user.id, parsed.data))
		? done(null)
		: stale("Não foi possível mover o alimento.");
}

/** Nova ordem das refeições (painel "Reordenar refeições"). */
export async function reorderMealsAction(
	mealIds: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = z.array(id).min(1).max(30).safeParse(mealIds);
	if (!parsed.success) return fail("Ordem inválida.");
	return (await reorderMeals(user.id, parsed.data))
		? done(null)
		: stale("Não foi possível reordenar as refeições.");
}

/** Apaga refeições e alimentos e recria as 3 refeições em branco. */
export async function resetDietAction(): Promise<ActionResult<DietMeal[]>> {
	const user = await getCurrentUser();
	return done(await resetDiet(user.id));
}

// --- Opções do item ---------------------------------------------------------

/** Nova opção pro item ("ou 1 banana"); devolve a opção criada. */
export async function addItemOptionAction(
	input: unknown,
): Promise<ActionResult<DietItemOption>> {
	const user = await getCurrentUser();
	const parsed = z
		.object({ itemId: id, foodId: id, quantity })
		.safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");

	const food = await findVisibleFood(user.id, parsed.data.foodId);
	if (!food) return fail("Alimento não encontrado.");

	const row = await addItemOption(
		user.id,
		parsed.data.itemId,
		food.id,
		parsed.data.quantity,
	);
	if (row === "not-found") return stale("Alimento não encontrado.");
	if (row === "full") {
		return fail(`Cada alimento aceita até ${MAX_ITEM_OPTIONS} opções.`);
	}
	return done({ ...row, food });
}

export async function deleteItemOptionAction(
	optionId: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(optionId);
	if (!parsed.success) return fail("Opção inválida.");
	return (await deleteItemOption(user.id, parsed.data))
		? done(null)
		: stale("Opção não encontrada.");
}

/** Troca o alimento do item pela opção (e o de antes vira a opção). */
export async function swapItemOptionAction(
	optionId: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(optionId);
	if (!parsed.success) return fail("Opção inválida.");
	return (await swapItemOption(user.id, parsed.data))
		? done(null)
		: stale("Opção não encontrada.");
}

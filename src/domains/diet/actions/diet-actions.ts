"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	addItem,
	addMeal,
	deleteItem,
	deleteMeal,
	reorderMeals,
	updateItemQuantity,
	updateMeal,
} from "~/domains/diet/services/diet-service";
import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import { findVisibleFood } from "~/domains/food/services/food-service";

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

export async function reorderMealsAction(ids: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = z.array(id).safeParse(ids);
	if (!parsed.success) return fail("Ordem inválida.");
	return (await reorderMeals(user.id, parsed.data))
		? done(null)
		: stale("Não foi possível reordenar.");
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
		.object({ mealId: id, foodId: id, quantity })
		.safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");

	const food = await findVisibleFood(user.id, parsed.data.foodId);
	if (!food) return fail("Alimento não encontrado.");

	const row = await addItem(
		user.id,
		parsed.data.mealId,
		food.id,
		parsed.data.quantity,
	);
	return row ? done({ ...row, food }) : stale("Refeição não encontrada.");
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

export async function deleteItemAction(itemId: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(itemId);
	if (!parsed.success) return fail("Alimento inválido.");
	return (await deleteItem(user.id, parsed.data))
		? done(null)
		: stale("Alimento não encontrado.");
}

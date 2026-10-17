"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { customFoodSchema } from "~/domains/food/schemas/food-schema";
import {
	createCustomFood,
	deleteCustomFood,
	searchFoods,
	updateCustomFood,
} from "~/domains/food/services/food-service";
import type { Food } from "~/domains/food/types/food-types";

export type ActionResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

export async function searchFoodsAction(query: unknown): Promise<Food[]> {
	const user = await getCurrentUser();
	const parsed = z.string().max(80).safeParse(query);
	if (!parsed.success) return [];
	return searchFoods(user.id, parsed.data);
}

export async function createFoodAction(
	input: unknown,
): Promise<ActionResult<Food>> {
	const user = await getCurrentUser();
	const parsed = customFoodSchema.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
		};
	}
	return { ok: true, data: await createCustomFood(user.id, parsed.data) };
}

export async function updateFoodAction(
	foodId: unknown,
	input: unknown,
): Promise<ActionResult<Food>> {
	const user = await getCurrentUser();
	const parsedId = z.uuid().safeParse(foodId);
	const parsed = customFoodSchema.safeParse(input);
	if (!parsedId.success || !parsed.success) {
		return {
			ok: false,
			error: parsed.error?.issues[0]?.message ?? "Dados inválidos.",
		};
	}
	const updated = await updateCustomFood(user.id, parsedId.data, parsed.data);
	if (updated === "not-found") {
		return { ok: false, error: "Alimento não encontrado." };
	}
	if (updated === "unit-in-use") {
		return {
			ok: false,
			error:
				"Esse alimento está na sua dieta: não dá pra mudar a unidade. Cadastre um novo.",
		};
	}
	return { ok: true, data: updated };
}

export async function deleteFoodAction(
	foodId: unknown,
): Promise<ActionResult<null>> {
	const user = await getCurrentUser();
	const parsed = z.uuid().safeParse(foodId);
	if (!parsed.success) return { ok: false, error: "Alimento inválido." };
	return (await deleteCustomFood(user.id, parsed.data))
		? { ok: true, data: null }
		: { ok: false, error: "Alimento não encontrado." };
}

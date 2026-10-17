"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { customFoodSchema } from "~/domains/food/schemas/food-schema";
import {
	createCustomFood,
	searchFoods,
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

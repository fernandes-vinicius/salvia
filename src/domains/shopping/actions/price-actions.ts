"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	deleteUserPrice,
	upsertUserPrice,
} from "~/domains/shopping/services/price-service";
import { priceKey } from "~/domains/shopping/utils/prices";

export type PriceResult = { ok: true } | { ok: false; error: string };

const itemName = z.string().trim().min(1).max(120);

/** Salva o preço que a pessoa paga (vale nas contas no lugar da referência). */
export async function setUserPriceAction(input: unknown): Promise<PriceResult> {
	const user = await getCurrentUser();
	const parsed = z
		.object({
			name: itemName,
			value: z.number().positive("Digite um preço maior que zero.").max(10_000),
			per: z.enum(["kg", "L", "un", "dz"]),
		})
		.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			error: parsed.error.issues[0]?.message ?? "Preço inválido.",
		};
	}
	const { name, value, per } = parsed.data;
	await upsertUserPrice(user.id, priceKey(name), { value, per });
	return { ok: true };
}

/** Volta ao preço de referência. */
export async function resetUserPriceAction(
	name: unknown,
): Promise<PriceResult> {
	const user = await getCurrentUser();
	const parsed = itemName.safeParse(name);
	if (!parsed.success) return { ok: false, error: "Item inválido." };
	await deleteUserPrice(user.id, priceKey(parsed.data));
	return { ok: true };
}

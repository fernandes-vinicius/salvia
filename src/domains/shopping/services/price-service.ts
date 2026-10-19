import "server-only";

import { and, eq } from "drizzle-orm";

import type { Price } from "~/domains/shopping/data/reference-prices";
import { db } from "~/shared/db";
import { userPrice } from "~/shared/db/schema";

/** Preços do usuário como lista serializável (`[chave, preço]`). */
export async function listUserPrices(
	userId: string,
): Promise<[string, Price][]> {
	const rows = await db
		.select({
			key: userPrice.itemKey,
			value: userPrice.value,
			per: userPrice.per,
		})
		.from(userPrice)
		.where(eq(userPrice.userId, userId));
	return rows.map((row) => [row.key, { value: row.value, per: row.per }]);
}

export async function upsertUserPrice(
	userId: string,
	itemKey: string,
	price: Price,
) {
	await db
		.insert(userPrice)
		.values({ userId, itemKey, ...price })
		.onConflictDoUpdate({
			target: [userPrice.userId, userPrice.itemKey],
			set: { value: price.value, per: price.per },
		});
}

export async function deleteUserPrice(userId: string, itemKey: string) {
	await db
		.delete(userPrice)
		.where(and(eq(userPrice.userId, userId), eq(userPrice.itemKey, itemKey)));
}

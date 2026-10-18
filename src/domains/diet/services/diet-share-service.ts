import "server-only";

import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { getDiet } from "~/domains/diet/services/diet-service";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { db } from "~/shared/db";
import { dietShare } from "~/shared/db/schema";

/** 16 caracteres url-safe (96 bits): impossível de adivinhar. */
const newToken = () => randomBytes(12).toString("base64url");

export async function findDietShare(userId: string) {
	const [row] = await db
		.select({ token: dietShare.token })
		.from(dietShare)
		.where(eq(dietShare.userId, userId))
		.limit(1);
	return row?.token ?? null;
}

/** Cria o link ou, com `renew`, troca o token (o link antigo para de abrir). */
export async function createDietShare(userId: string, renew = false) {
	const token = newToken();
	const [row] = await db
		.insert(dietShare)
		.values({ userId, token })
		.onConflictDoUpdate(
			renew
				? { target: dietShare.userId, set: { token, createdAt: new Date() } }
				: { target: dietShare.userId, set: { userId } },
		)
		.returning({ token: dietShare.token });
	return row.token;
}

export async function deleteDietShare(userId: string) {
	await db.delete(dietShare).where(eq(dietShare.userId, userId));
}

/** Dieta atual de quem compartilhou; null se o link não existe mais. */
export async function getSharedDiet(token: string): Promise<DietMeal[] | null> {
	const [row] = await db
		.select({ userId: dietShare.userId })
		.from(dietShare)
		.where(eq(dietShare.token, token))
		.limit(1);
	if (!row) return null;
	return getDiet(row.userId, { createIfEmpty: false });
}

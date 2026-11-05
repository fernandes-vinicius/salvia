import "server-only";

import { and, asc, eq } from "drizzle-orm";

import {
	MAX_SUPPLEMENTS,
	type SupplementInput,
} from "~/domains/supplements/schemas/supplement-schema";
import type { Supplement } from "~/domains/supplements/types/supplement-types";
import { db } from "~/shared/db";
import {
	dietMeal,
	dietSupplement,
	supplementCheckin,
} from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

const columns = {
	id: dietSupplement.id,
	name: dietSupplement.name,
	dose: dietSupplement.dose,
	unit: dietSupplement.unit,
	timing: dietSupplement.timing,
	mealId: dietSupplement.mealId,
	time: dietSupplement.time,
	days: dietSupplement.days,
	weekdays: dietSupplement.weekdays,
	note: dietSupplement.note,
};

export async function listSupplements(userId: string): Promise<Supplement[]> {
	return db
		.select(columns)
		.from(dietSupplement)
		.where(eq(dietSupplement.userId, userId))
		.orderBy(asc(dietSupplement.position), asc(dietSupplement.createdAt));
}

/** A refeição escolhida precisa ser da pessoa (senão sumiu em outra aba). */
async function ownsMeal(userId: string, mealId: string | null) {
	if (!mealId) return true;
	const [meal] = await db
		.select({ id: dietMeal.id })
		.from(dietMeal)
		.where(and(eq(dietMeal.id, mealId), eq(dietMeal.userId, userId)))
		.limit(1);
	return Boolean(meal);
}

export type SupplementWriteStatus = "ok" | "not-found" | "meal-gone" | "limit";

/**
 * Novo suplemento no fim da lista ou, com `index` (desfazer exclusão), na
 * posição de antes, empurrando os seguintes.
 */
export async function addSupplement(
	userId: string,
	input: SupplementInput,
	index?: number,
): Promise<{ status: SupplementWriteStatus; supplement?: Supplement }> {
	if (!(await ownsMeal(userId, input.mealId))) return { status: "meal-gone" };

	const supplement = await db.transaction(async (tx) => {
		const current = await tx
			.select({ id: dietSupplement.id })
			.from(dietSupplement)
			.where(eq(dietSupplement.userId, userId))
			.orderBy(asc(dietSupplement.position), asc(dietSupplement.createdAt));
		if (current.length >= MAX_SUPPLEMENTS) return null;

		const position =
			index === undefined
				? current.length
				: Math.max(0, Math.min(index, current.length));
		for (const [i, row] of current.entries()) {
			const next = i < position ? i : i + 1;
			await tx
				.update(dietSupplement)
				.set({ position: next })
				.where(eq(dietSupplement.id, row.id));
		}
		const [row] = await tx
			.insert(dietSupplement)
			.values({ userId, ...input, position })
			.returning(columns);
		return row;
	});

	return supplement ? { status: "ok", supplement } : { status: "limit" };
}

export async function updateSupplement(
	userId: string,
	id: string,
	input: SupplementInput,
): Promise<{ status: SupplementWriteStatus; supplement?: Supplement }> {
	if (!(await ownsMeal(userId, input.mealId))) return { status: "meal-gone" };
	const [row] = await db
		.update(dietSupplement)
		.set(input)
		.where(and(eq(dietSupplement.id, id), eq(dietSupplement.userId, userId)))
		.returning(columns);
	return row ? { status: "ok", supplement: row } : { status: "not-found" };
}

export async function deleteSupplement(userId: string, id: string) {
	const deleted = await db
		.delete(dietSupplement)
		.where(and(eq(dietSupplement.id, id), eq(dietSupplement.userId, userId)))
		.returning({ id: dietSupplement.id });
	return deleted.length > 0;
}

/** Nova ordem: precisa ter exatamente os suplementos da pessoa. */
export async function reorderSupplements(userId: string, ids: string[]) {
	const current = await db
		.select({ id: dietSupplement.id })
		.from(dietSupplement)
		.where(eq(dietSupplement.userId, userId));
	const known = new Set(current.map((row) => row.id));
	if (
		ids.length !== current.length ||
		new Set(ids).size !== ids.length ||
		!ids.every((id) => known.has(id))
	) {
		return false;
	}
	await db.transaction(async (tx) => {
		for (const [position, id] of ids.entries()) {
			await tx
				.update(dietSupplement)
				.set({ position })
				.where(eq(dietSupplement.id, id));
		}
	});
	return true;
}

/** Ids dos suplementos marcados como tomados no dia. */
export async function listSupplementCheckins(userId: string, day: string) {
	const rows = await db
		.select({ supplementId: supplementCheckin.supplementId })
		.from(supplementCheckin)
		.where(
			and(eq(supplementCheckin.userId, userId), eq(supplementCheckin.day, day)),
		);
	return rows.flatMap((row) => (row.supplementId ? [row.supplementId] : []));
}

/**
 * Marca (ou desmarca) o suplemento como tomado hoje, no fuso do app. Só
 * suplementos da própria pessoa.
 */
export async function setSupplementCheckin(
	userId: string,
	supplementId: string,
	taken: boolean,
) {
	const [supplement] = await db
		.select({ name: dietSupplement.name })
		.from(dietSupplement)
		.where(
			and(
				eq(dietSupplement.id, supplementId),
				eq(dietSupplement.userId, userId),
			),
		)
		.limit(1);
	if (!supplement) return false;

	const day = localDateString();
	if (!taken) {
		await db
			.delete(supplementCheckin)
			.where(
				and(
					eq(supplementCheckin.userId, userId),
					eq(supplementCheckin.supplementId, supplementId),
					eq(supplementCheckin.day, day),
				),
			);
		return true;
	}

	await db
		.insert(supplementCheckin)
		.values({ userId, supplementId, supplementName: supplement.name, day })
		.onConflictDoNothing();
	return true;
}

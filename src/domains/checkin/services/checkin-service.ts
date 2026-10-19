import "server-only";

import { and, asc, eq, gte } from "drizzle-orm";

import type {
	Checkin,
	CheckinStatus,
} from "~/domains/checkin/types/checkin-types";
import { db } from "~/shared/db";
import { dietMeal, mealCheckin } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

/** Check-ins desde `sinceDay` (inclusive), pra sequência e semana. */
export async function listCheckins(
	userId: string,
	sinceDay: string,
): Promise<Checkin[]> {
	return db
		.select({
			mealId: mealCheckin.mealId,
			day: mealCheckin.day,
			status: mealCheckin.status,
		})
		.from(mealCheckin)
		.where(and(eq(mealCheckin.userId, userId), gte(mealCheckin.day, sinceDay)))
		.orderBy(asc(mealCheckin.day));
}

/**
 * Marca (ou, com `status` nulo, desmarca) a refeição no dia de hoje, no fuso
 * do app. Só refeições do próprio usuário.
 */
export async function setCheckin(
	userId: string,
	mealId: string,
	status: CheckinStatus | null,
) {
	const [meal] = await db
		.select({ name: dietMeal.name })
		.from(dietMeal)
		.where(and(eq(dietMeal.id, mealId), eq(dietMeal.userId, userId)))
		.limit(1);
	if (!meal) return false;

	const day = localDateString();
	if (status === null) {
		await db
			.delete(mealCheckin)
			.where(
				and(
					eq(mealCheckin.userId, userId),
					eq(mealCheckin.mealId, mealId),
					eq(mealCheckin.day, day),
				),
			);
		return true;
	}

	await db
		.insert(mealCheckin)
		.values({ userId, mealId, mealName: meal.name, day, status })
		.onConflictDoUpdate({
			target: [mealCheckin.mealId, mealCheckin.day],
			set: { status, mealName: meal.name },
		});
	return true;
}

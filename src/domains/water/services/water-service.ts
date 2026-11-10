import "server-only";

import { and, asc, eq, gte } from "drizzle-orm";

import type { WaterDay } from "~/domains/water/types/water-types";
import { db } from "~/shared/db";
import { waterLog } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

/** Registros desde `sinceDay` (inclusive), pra sequência e semana. */
export async function listWaterLogs(
	userId: string,
	sinceDay: string,
): Promise<WaterDay[]> {
	return db
		.select({
			day: waterLog.day,
			ml: waterLog.ml,
			targetMl: waterLog.targetMl,
			entries: waterLog.entries,
		})
		.from(waterLog)
		.where(and(eq(waterLog.userId, userId), gte(waterLog.day, sinceDay)))
		.orderBy(asc(waterLog.day));
}

/** Grava o total de hoje (fuso do app), os registros e o recomendado de agora. */
export async function setTodayWater(
	userId: string,
	ml: number,
	entries: number[],
	targetMl: number,
) {
	await db
		.insert(waterLog)
		.values({ userId, day: localDateString(), ml, entries, targetMl })
		.onConflictDoUpdate({
			target: [waterLog.userId, waterLog.day],
			set: { ml, entries, targetMl },
		});
}

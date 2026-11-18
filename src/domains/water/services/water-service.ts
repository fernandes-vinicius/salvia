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

/**
 * Grava o total do dia, os registros e o recomendado de agora. Num dia passado
 * que já tinha registro, o recomendado daquele dia continua o mesmo.
 */
export async function setWater(
	userId: string,
	day: string,
	ml: number,
	entries: number[],
	targetMl: number,
) {
	const keepTarget = day !== localDateString();
	await db
		.insert(waterLog)
		.values({ userId, day, ml, entries, targetMl })
		.onConflictDoUpdate({
			target: [waterLog.userId, waterLog.day],
			set: keepTarget ? { ml, entries } : { ml, entries, targetMl },
		});
}

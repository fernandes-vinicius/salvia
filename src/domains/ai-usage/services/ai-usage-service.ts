import "server-only";

import { and, eq, sql } from "drizzle-orm";

import {
	AI_DAILY_LIMITS,
	type AiFeature,
} from "~/domains/ai-usage/utils/ai-usage";
import { db } from "~/shared/db";
import { aiUsage } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

/**
 * Conta mais um uso de hoje, se ainda couber no limite. Atômico: o
 * incremento só acontece com `count < limite`, então dois cliques ao mesmo
 * tempo não passam do limite. `false` = limite do dia atingido.
 */
export async function consumeAiQuota(userId: string, feature: AiFeature) {
	const limit = AI_DAILY_LIMITS[feature];
	const rows = await db
		.insert(aiUsage)
		.values({ userId, feature, day: localDateString(), count: 1 })
		.onConflictDoUpdate({
			target: [aiUsage.userId, aiUsage.feature, aiUsage.day],
			set: { count: sql`${aiUsage.count} + 1` },
			setWhere: sql`${aiUsage.count} < ${limit}`,
		})
		.returning({ count: aiUsage.count });
	return rows.length > 0;
}

/** Devolve um uso quando a IA falhou (não cobra o que não entregou). */
export async function refundAiQuota(userId: string, feature: AiFeature) {
	await db
		.update(aiUsage)
		.set({ count: sql`greatest(${aiUsage.count} - 1, 0)` })
		.where(
			and(
				eq(aiUsage.userId, userId),
				eq(aiUsage.feature, feature),
				eq(aiUsage.day, localDateString()),
			),
		);
}

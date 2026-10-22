import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import {
	type AiFeature,
	monthStartOf,
	type QuotaVerdict,
	quotaVerdict,
} from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import type { User } from "~/domains/auth/types/user-types";
import { db } from "~/shared/db";
import { aiUsage } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

/**
 * Conta mais um uso de hoje, se ainda couber no limite do dia e na cota do
 * mês (o beta não tem cota do mês). Atômico: a trava por pessoa × recurso
 * faz dois cliques ao mesmo tempo esperarem um pelo outro, então nenhum
 * passa do limite. `"daily"`/`"monthly"` = qual limite barrou.
 */
export async function consumeAiQuota(
	user: Pick<User, "id" | "email">,
	feature: AiFeature,
): Promise<QuotaVerdict> {
	const day = localDateString();
	const unlimitedMonth = isBetaUser(user);
	return db.transaction(async (tx) => {
		await tx.execute(
			sql`select pg_advisory_xact_lock(hashtext(${`ai-usage:${user.id}:${feature}`}))`,
		);
		const [usage] = await tx
			.select({
				today: sql<number>`coalesce(sum(${aiUsage.count}) filter (where ${aiUsage.day} = ${day}), 0)::int`,
				month: sql<number>`coalesce(sum(${aiUsage.count}), 0)::int`,
			})
			.from(aiUsage)
			.where(
				and(
					eq(aiUsage.userId, user.id),
					eq(aiUsage.feature, feature),
					gte(aiUsage.day, monthStartOf(day)),
				),
			);
		const verdict = quotaVerdict(feature, {
			today: usage?.today ?? 0,
			month: usage?.month ?? 0,
			unlimitedMonth,
		});
		if (verdict !== "ok") return verdict;
		await tx
			.insert(aiUsage)
			.values({ userId: user.id, feature, day, count: 1 })
			.onConflictDoUpdate({
				target: [aiUsage.userId, aiUsage.feature, aiUsage.day],
				set: { count: sql`${aiUsage.count} + 1` },
			});
		return "ok";
	});
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

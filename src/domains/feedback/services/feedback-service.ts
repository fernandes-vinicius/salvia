import "server-only";

import { and, count, eq, gte } from "drizzle-orm";

import type { FeedbackInput } from "~/domains/feedback/schemas/feedback-schema";
import { db } from "~/shared/db";
import { feedback } from "~/shared/db/schema";

/** Envios por pessoa a cada 24 h (evita spam sem atrapalhar quem usa). */
export const FEEDBACK_DAILY_LIMIT = 5;

export async function sendFeedback(
	userId: string,
	input: FeedbackInput,
): Promise<"sent" | "limit"> {
	const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
	const [{ total }] = await db
		.select({ total: count() })
		.from(feedback)
		.where(and(eq(feedback.userId, userId), gte(feedback.createdAt, since)));
	if (total >= FEEDBACK_DAILY_LIMIT) return "limit";

	await db.insert(feedback).values({ userId, ...input });
	return "sent";
}

import "server-only";

import { eq } from "drizzle-orm";

import type { Goal } from "~/domains/goal/types/goal-types";
import { db } from "~/shared/db";
import { goal } from "~/shared/db/schema";

export async function findGoalByUserId(userId: string): Promise<Goal | null> {
	const [row] = await db
		.select({
			objective: goal.objective,
			calorieAdjustment: goal.calorieAdjustment,
			proteinPerKg: goal.proteinPerKg,
			fatPerKg: goal.fatPerKg,
		})
		.from(goal)
		.where(eq(goal.userId, userId))
		.limit(1);

	return row ?? null;
}

export async function upsertGoal(userId: string, data: Goal) {
	await db
		.insert(goal)
		.values({ userId, ...data })
		.onConflictDoUpdate({ target: goal.userId, set: data });
}

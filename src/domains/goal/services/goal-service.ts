import "server-only";

import { eq, sql } from "drizzle-orm";

import type { Goal, GoalCalibration } from "~/domains/goal/types/goal-types";
import { db } from "~/shared/db";
import { goal } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

export async function findGoalByUserId(userId: string): Promise<Goal | null> {
	const [row] = await db
		.select({
			objective: goal.objective,
			calorieAdjustment: goal.calorieAdjustment,
			proteinPerKg: goal.proteinPerKg,
			fatPerKg: goal.fatPerKg,
			carbsPerKg: goal.carbsPerKg,
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
		.onConflictDoUpdate({
			target: goal.userId,
			set: {
				...data,
				// Mudou o objetivo/ritmo: as pesagens anteriores eram de outro
				// plano, então a conferência do ajuste pelo peso recomeça.
				calibratedAt: sql`case when ${goal.calorieAdjustment} <> excluded.calorie_adjustment then now() else ${goal.calibratedAt} end`,
			},
		});
}

/** Correção do gasto pelo peso; sem meta salva = sem correção. */
export async function findGoalCalibration(
	userId: string,
): Promise<GoalCalibration> {
	const [row] = await db
		.select({
			kcal: goal.calibrationKcal,
			calibratedAt: goal.calibratedAt,
		})
		.from(goal)
		.where(eq(goal.userId, userId))
		.limit(1);

	return {
		kcal: row?.kcal ?? 0,
		since: row?.calibratedAt ? localDateString(row.calibratedAt) : null,
	};
}

/** Grava a nova correção e recomeça a contagem das pesagens a partir de agora. */
export async function saveGoalCalibration(userId: string, kcal: number) {
	await db
		.update(goal)
		.set({ calibrationKcal: kcal, calibratedAt: new Date() })
		.where(eq(goal.userId, userId));
}

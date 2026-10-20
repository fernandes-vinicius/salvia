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
	const today = localDateString();
	// Mudou o objetivo/ritmo: as pesagens anteriores eram de outro plano,
	// então a conferência do ajuste pelo peso e as revisões recomeçam.
	const changedPlan = sql`(${goal.calorieAdjustment} <> excluded.calorie_adjustment or ${goal.objective} <> excluded.objective)`;
	await db
		.insert(goal)
		.values({ userId, ...data, startedOn: today })
		.onConflictDoUpdate({
			target: goal.userId,
			set: {
				...data,
				calibratedAt: sql`case when ${changedPlan} then now() else ${goal.calibratedAt} end`,
				startedOn: sql`case when ${changedPlan} or ${goal.startedOn} is null then ${today}::date else ${goal.startedOn} end`,
				reviewedDay: sql`case when ${changedPlan} then 0 else ${goal.reviewedDay} end`,
			},
		});
}

/** Começo da dieta e último marco revisado (revisões de 15 e 30 dias). */
export async function findDietCycle(userId: string) {
	const [row] = await db
		.select({ startedOn: goal.startedOn, reviewedDay: goal.reviewedDay })
		.from(goal)
		.where(eq(goal.userId, userId))
		.limit(1);
	return row ?? null;
}

export async function saveReviewedDay(userId: string, reviewedDay: number) {
	await db.update(goal).set({ reviewedDay }).where(eq(goal.userId, userId));
}

/** "Recomeçar a contagem": a dieta passa a contar de hoje. */
export async function restartDietCycle(userId: string) {
	await db
		.update(goal)
		.set({ startedOn: localDateString(), reviewedDay: 0 })
		.where(eq(goal.userId, userId));
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

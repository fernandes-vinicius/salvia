import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { getDiet } from "~/domains/diet/services/diet-service";
import { db } from "~/shared/db";
import {
	aiUsage,
	bodyMeasurement,
	dietShare,
	feedback,
	food,
	goal,
	mealCheckin,
	profile,
	savedRecipe,
	settings,
	user,
	userActivity,
	userPrice,
} from "~/shared/db/schema";

/** Tira a coluna `userId` (repetida em toda linha, não diz nada a mais). */
function withoutUserId<T extends { userId?: unknown }>(rows: T[]) {
	return rows.map(({ userId: _, ...row }) => row);
}

// "Baixar meus dados" (portabilidade, LGPD art. 18): tudo o que o app guarda
// da pessoa, num JSON legível. Fica de fora só o que é da autenticação
// (sessões e tokens do Google), que não é dado dela.
export async function exportUserData(userId: string) {
	const [
		[account],
		profileRows,
		goalRows,
		settingsRows,
		meals,
		customFoods,
		measurements,
		checkins,
		recipes,
		prices,
		share,
		feedbackRows,
		activity,
		ai,
	] = await Promise.all([
		db
			.select({ name: user.name, email: user.email, createdAt: user.createdAt })
			.from(user)
			.where(eq(user.id, userId)),
		db.select().from(profile).where(eq(profile.userId, userId)),
		db.select().from(goal).where(eq(goal.userId, userId)),
		db.select().from(settings).where(eq(settings.userId, userId)),
		getDiet(userId, { createIfEmpty: false }),
		db
			.select()
			.from(food)
			.where(and(eq(food.userId, userId), eq(food.source, "custom")))
			.orderBy(asc(food.name)),
		db
			.select()
			.from(bodyMeasurement)
			.where(eq(bodyMeasurement.userId, userId))
			.orderBy(asc(bodyMeasurement.measuredOn)),
		db
			.select()
			.from(mealCheckin)
			.where(eq(mealCheckin.userId, userId))
			.orderBy(asc(mealCheckin.day)),
		db
			.select()
			.from(savedRecipe)
			.where(eq(savedRecipe.userId, userId))
			.orderBy(asc(savedRecipe.createdAt)),
		db.select().from(userPrice).where(eq(userPrice.userId, userId)),
		db.select().from(dietShare).where(eq(dietShare.userId, userId)),
		db
			.select()
			.from(feedback)
			.where(eq(feedback.userId, userId))
			.orderBy(asc(feedback.createdAt)),
		db
			.select()
			.from(userActivity)
			.where(eq(userActivity.userId, userId))
			.orderBy(asc(userActivity.day)),
		db.select().from(aiUsage).where(eq(aiUsage.userId, userId)),
	]);

	return {
		exportedAt: new Date().toISOString(),
		account: account ?? null,
		profile: withoutUserId(profileRows)[0] ?? null,
		goal: withoutUserId(goalRows)[0] ?? null,
		settings: withoutUserId(settingsRows)[0] ?? null,
		diet: meals,
		customFoods: withoutUserId(customFoods),
		measurements: withoutUserId(measurements),
		checkins: withoutUserId(checkins),
		savedRecipes: withoutUserId(recipes),
		prices: withoutUserId(prices),
		dietShareLink: share.length > 0,
		feedback: withoutUserId(feedbackRows),
		activeDays: activity.map((row) => row.day),
		aiUsage: withoutUserId(ai),
	};
}

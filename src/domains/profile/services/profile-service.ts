import "server-only";

import { eq } from "drizzle-orm";

import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { db } from "~/shared/db";
import { profile } from "~/shared/db/schema";

export async function findProfileByUserId(
	userId: string,
): Promise<BodyProfile | null> {
	const [row] = await db
		.select({
			sex: profile.sex,
			ageYears: profile.ageYears,
			weightKg: profile.weightKg,
			heightCm: profile.heightCm,
			activityFactor: profile.activityFactor,
		})
		.from(profile)
		.where(eq(profile.userId, userId))
		.limit(1);

	return row ?? null;
}

export async function upsertProfile(userId: string, data: BodyProfile) {
	await db
		.insert(profile)
		.values({ userId, ...data })
		.onConflictDoUpdate({ target: profile.userId, set: data });
}

import "server-only";

import { eq } from "drizzle-orm";

import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { db } from "~/shared/db";
import { profile } from "~/shared/db/schema";

export async function findProfileByUserId(
	userId: string,
): Promise<BodyProfile | null> {
	const [row] = await db
		.select()
		.from(profile)
		.where(eq(profile.userId, userId))
		.limit(1);

	if (!row) return null;

	return {
		sex: row.sex,
		ageYears: row.ageYears,
		weightKg: row.weightKg,
		heightCm: row.heightCm,
		neatFactor: row.neatFactor,
		strength: {
			enabled: row.strengthEnabled,
			daysPerWeek: row.strengthDays,
			minutesPerSession: row.strengthMinutes,
			met: row.strengthMet,
		},
		cardio: {
			enabled: row.cardioEnabled,
			daysPerWeek: row.cardioDays,
			minutesPerSession: row.cardioMinutes,
			met: row.cardioMet,
		},
	};
}

export async function upsertProfile(userId: string, data: BodyProfile) {
	const values = {
		sex: data.sex,
		ageYears: data.ageYears,
		weightKg: data.weightKg,
		heightCm: data.heightCm,
		neatFactor: data.neatFactor,
		strengthEnabled: data.strength.enabled,
		strengthDays: data.strength.daysPerWeek,
		strengthMinutes: data.strength.minutesPerSession,
		strengthMet: data.strength.met,
		cardioEnabled: data.cardio.enabled,
		cardioDays: data.cardio.daysPerWeek,
		cardioMinutes: data.cardio.minutesPerSession,
		cardioMet: data.cardio.met,
	};

	await db
		.insert(profile)
		.values({ userId, ...values })
		.onConflictDoUpdate({ target: profile.userId, set: values });
}

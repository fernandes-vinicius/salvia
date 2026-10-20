import "server-only";

import { eq } from "drizzle-orm";

import { DEFAULT_PROTEIN_COUNTING } from "~/domains/goal/utils/protein-counting";
import { DEFAULT_BMR_FORMULA } from "~/domains/profile/utils/energy";
import type { UserSettings } from "~/domains/settings/types/settings-types";
import { db } from "~/shared/db";
import { settings } from "~/shared/db/schema";

export const DEFAULT_SETTINGS: UserSettings = {
	bmrFormula: DEFAULT_BMR_FORMULA,
	celebrations: true,
	proteinCounting: DEFAULT_PROTEIN_COUNTING,
};

/** Sempre retorna configurações completas (padrão se o usuário não salvou). */
export async function getSettingsByUserId(
	userId: string,
): Promise<UserSettings> {
	const [row] = await db
		.select({
			bmrFormula: settings.bmrFormula,
			celebrations: settings.celebrations,
			proteinCounting: settings.proteinCounting,
		})
		.from(settings)
		.where(eq(settings.userId, userId))
		.limit(1);

	return row ?? DEFAULT_SETTINGS;
}

export async function upsertSettings(userId: string, data: UserSettings) {
	await db
		.insert(settings)
		.values({ userId, ...data })
		.onConflictDoUpdate({ target: settings.userId, set: data });
}

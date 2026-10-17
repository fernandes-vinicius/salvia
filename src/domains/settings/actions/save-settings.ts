"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { userSettingsSchema } from "~/domains/settings/schemas/settings-schema";
import { upsertSettings } from "~/domains/settings/services/settings-service";

export type SaveSettingsResult = { ok: true } | { ok: false; error: string };

// Autosave da tela Configurações (mesmo padrão de saveProfile/saveGoal).
export async function saveSettings(
	input: unknown,
): Promise<SaveSettingsResult> {
	const user = await getCurrentUser();

	const parsed = userSettingsSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Configuração inválida." };
	}

	await upsertSettings(user.id, parsed.data);
	return { ok: true };
}

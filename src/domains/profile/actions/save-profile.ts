"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { bodyProfileSchema } from "~/domains/profile/schemas/profile-schema";
import { upsertProfile } from "~/domains/profile/services/profile-service";

export type SaveProfileResult = { ok: true } | { ok: false; error: string };

// Chamada pelo autosave da aba TMB. Não dá `refresh()`: o client já tem o
// estado atualizado e um re-render do servidor só atrapalharia o slider.
export async function saveProfile(input: unknown): Promise<SaveProfileResult> {
	const user = await getCurrentUser();

	const parsed = bodyProfileSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Dados fora dos limites permitidos." };
	}

	await upsertProfile(user.id, parsed.data);
	return { ok: true };
}

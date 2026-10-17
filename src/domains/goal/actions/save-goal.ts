"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { goalSchema } from "~/domains/goal/schemas/goal-schema";
import { upsertGoal } from "~/domains/goal/services/goal-service";

export type SaveGoalResult = { ok: true } | { ok: false; error: string };

// Autosave da aba Meta (mesmo padrão do saveProfile).
export async function saveGoal(input: unknown): Promise<SaveGoalResult> {
	const user = await getCurrentUser();

	const parsed = goalSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Meta fora dos limites permitidos." };
	}

	await upsertGoal(user.id, parsed.data);
	return { ok: true };
}

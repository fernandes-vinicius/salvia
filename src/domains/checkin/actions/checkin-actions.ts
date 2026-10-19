"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { setCheckin } from "~/domains/checkin/services/checkin-service";

export type CheckinResult =
	| { ok: true }
	/** `stale`: a refeição não existe mais (mudou em outra aba/aparelho). */
	| { ok: false; error: string; stale?: boolean };

const input = z.object({
	mealId: z.uuid(),
	status: z.enum(["done", "option", "skipped"]).nullable(),
});

export async function setCheckinAction(data: unknown): Promise<CheckinResult> {
	const user = await getCurrentUser();
	const parsed = input.safeParse(data);
	if (!parsed.success) return { ok: false, error: "Marcação inválida." };
	return (await setCheckin(user.id, parsed.data.mealId, parsed.data.status))
		? { ok: true }
		: { ok: false, error: "Refeição não encontrada.", stale: true };
}

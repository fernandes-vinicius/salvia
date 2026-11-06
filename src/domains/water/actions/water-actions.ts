"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { suggestedWater } from "~/domains/calculators/utils/water";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { setTodayWater } from "~/domains/water/services/water-service";
import { MAX_DAY_ML } from "~/domains/water/utils/water-log";

export type WaterResult = { ok: true } | { ok: false; error: string };

const input = z.object({ ml: z.number().int().min(0).max(MAX_DAY_ML) });

// O recomendado sai do perfil no servidor (não confia no que o navegador manda).
export async function setTodayWaterAction(data: unknown): Promise<WaterResult> {
	const user = await getCurrentUser();
	const parsed = input.safeParse(data);
	if (!parsed.success) return { ok: false, error: "Quantidade inválida." };
	const profile = await findProfileByUserId(user.id);
	if (!profile) return { ok: false, error: "Preencha seus dados na aba TMB." };
	await setTodayWater(
		user.id,
		parsed.data.ml,
		suggestedWater(profile).recommendedMl,
	);
	return { ok: true };
}

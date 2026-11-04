"use server";

import { z } from "zod";

import { registerAiInterest } from "~/domains/ai-usage/services/ai-usage-service";
import { AI_FEATURES, INTEREST_COPY } from "~/domains/ai-usage/utils/ai-usage";
import { getCurrentUser } from "~/domains/auth/services/session-service";

export type AiInterestResult = { ok: true } | { ok: false; error: string };

const featureSchema = z.enum(AI_FEATURES);

export async function registerAiInterestAction(
	feature: unknown,
): Promise<AiInterestResult> {
	const user = await getCurrentUser();
	const parsed = featureSchema.safeParse(feature);
	if (!parsed.success) return { ok: false, error: INTEREST_COPY.error };
	await registerAiInterest(user.id, parsed.data);
	return { ok: true };
}

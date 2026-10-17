import { z } from "zod";

import { findActivityLevel } from "~/domains/profile/utils/energy";

export const BODY_RANGES = {
	ageYears: { min: 14, max: 90, step: 1 },
	weightKg: { min: 30, max: 200, step: 0.5 },
	heightCm: { min: 120, max: 220, step: 1 },
} as const;

export const bodyProfileSchema = z.object({
	sex: z.enum(["male", "female"]),
	ageYears: z
		.number()
		.int()
		.min(BODY_RANGES.ageYears.min)
		.max(BODY_RANGES.ageYears.max),
	weightKg: z
		.number()
		.min(BODY_RANGES.weightKg.min)
		.max(BODY_RANGES.weightKg.max),
	heightCm: z
		.number()
		.int()
		.min(BODY_RANGES.heightCm.min)
		.max(BODY_RANGES.heightCm.max),
	// Só os níveis pré-definidos: o usuário escolhe o perfil, nunca digita o
	// fator técnico.
	activityFactor: z
		.number()
		.refine((factor) => findActivityLevel(factor) !== undefined, {
			message: "Nível de atividade inválido.",
		}),
});

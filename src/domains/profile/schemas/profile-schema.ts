import { z } from "zod";

import {
	CARDIO_INTENSITIES,
	findOption,
	NEAT_LEVELS,
	type Option,
	STRENGTH_INTENSITIES,
	TRAINING_RANGES,
} from "~/domains/profile/utils/energy";

export const BODY_RANGES = {
	ageYears: { min: 14, max: 90, step: 1 },
	weightKg: { min: 30, max: 200, step: 0.5 },
	heightCm: { min: 120, max: 220, step: 1 },
} as const;

// Valores técnicos (NEAT, MET) só podem vir das opções da UI.
function optionValue(options: Option[], message: string) {
	return z
		.number()
		.refine((value) => findOption(options, value) !== undefined, { message });
}

function trainingSchema(
	minutes: { min: number; max: number },
	intensities: Option[],
) {
	return z.object({
		enabled: z.boolean(),
		daysPerWeek: z
			.number()
			.int()
			.min(TRAINING_RANGES.daysPerWeek.min)
			.max(TRAINING_RANGES.daysPerWeek.max),
		minutesPerSession: z.number().int().min(minutes.min).max(minutes.max),
		met: optionValue(intensities, "Intensidade inválida."),
	});
}

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
	neatFactor: optionValue(NEAT_LEVELS, "Nível do dia a dia inválido."),
	strength: trainingSchema(
		TRAINING_RANGES.strengthMinutes,
		STRENGTH_INTENSITIES,
	),
	cardio: trainingSchema(TRAINING_RANGES.cardioMinutes, CARDIO_INTENSITIES),
});

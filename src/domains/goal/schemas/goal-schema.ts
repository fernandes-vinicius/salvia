import { z } from "zod";

import {
	CUSTOM_ADJUSTMENT_RANGE,
	MACRO_RANGES,
} from "~/domains/goal/utils/goal";

export const goalSchema = z
	.object({
		objective: z.enum(["lose", "maintain", "gain"]),
		calorieAdjustment: z
			.number()
			.int()
			.min(-CUSTOM_ADJUSTMENT_RANGE.max)
			.max(CUSTOM_ADJUSTMENT_RANGE.max),
		proteinPerKg: z
			.number()
			.min(MACRO_RANGES.proteinPerKg.min)
			.max(MACRO_RANGES.proteinPerKg.max),
		fatPerKg: z
			.number()
			.min(MACRO_RANGES.fatPerKg.min)
			.max(MACRO_RANGES.fatPerKg.max),
	})
	// O sinal do ajuste tem que bater com o objetivo.
	.refine(
		({ objective, calorieAdjustment }) =>
			objective === "lose"
				? calorieAdjustment < 0
				: objective === "gain"
					? calorieAdjustment > 0
					: calorieAdjustment === 0,
		{ message: "Ajuste de calorias incompatível com o objetivo." },
	);

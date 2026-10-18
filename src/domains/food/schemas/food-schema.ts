import { z } from "zod";

export const customFoodSchema = z.object({
	name: z.string().trim().min(2, "Dê um nome ao alimento.").max(80),
	unit: z.enum(["g", "ml", "unit"]),
	protein: z.number().min(0).max(1000),
	carbs: z.number().min(0).max(1000),
	fat: z.number().min(0).max(1000),
	/** Opcional: muitos rótulos não trazem. */
	fiber: z.number().min(0).max(1000).default(0),
	proteinSource: z.enum(["animal", "vegetal"]),
});

export type CustomFoodInput = z.infer<typeof customFoodSchema>;

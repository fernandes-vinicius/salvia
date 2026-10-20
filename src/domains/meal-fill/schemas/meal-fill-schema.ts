import { z } from "zod";

import type { Food } from "~/domains/food/types/food-types";

// O que a IA devolve: os alimentos escolhidos (códigos) e como chamar. As
// quantidades são calculadas no servidor (`fillQuantities`).
export const aiMealFillSchema = z.object({
	// Primeiro os alimentos: título e resumo vêm depois e descrevem eles.
	picks: z
		.array(z.string())
		.describe(
			'Códigos dos alimentos escolhidos (ex.: ["F3", "F12"]), de 1 a 3, só da lista.',
		),
	title: z
		.string()
		.describe(
			'Nome curto do que entra na refeição, ex.: "Frango com batata-doce".',
		),
	summary: z
		.string()
		.describe(
			"Uma frase de como comer junto com o que a refeição já tem. Sem falar de dieta ou saúde.",
		),
});

export const suggestMealFillInputSchema = z.object({
	mealId: z.uuid(),
	/** Combinações já sugeridas ("Frango + Arroz"), pra não repetir. */
	avoid: z.array(z.string().max(300)).max(10),
});

/** A sugestão pronta pra mostrar: alimentos com as quantidades calculadas. */
export interface MealFill {
	title: string;
	summary: string;
	items: { food: Food; quantity: number }[];
	/** O que faltava no dia antes da sugestão. */
	gap: { protein: number; carbs: number; fat: number; kcal: number };
}

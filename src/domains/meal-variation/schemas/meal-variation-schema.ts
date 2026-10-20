import { z } from "zod";

import type { RecipeSwap } from "~/domains/meal-recipe/utils/recipe-swap";

// O que a IA devolve: a combinação de trocas (códigos) e como chamar.
export const aiVariationSchema = z.object({
	// Primeiro as trocas: o título e o resumo vêm depois e descrevem elas.
	swaps: z
		.array(z.string())
		.describe(
			'Códigos das trocas escolhidas (ex.: ["T2", "T5"]), pelo menos 1, só da lista "pode trocar por". No máximo um por alimento.',
		),
	title: z
		.string()
		.describe(
			'Nome curto da nova versão da refeição, ex.: "Ceia de pão com banana".',
		),
	summary: z
		.string()
		.describe(
			"Uma frase de como comer junto (ex.: torrada com banana e um copo de leite batido com whey). Sem falar de dieta ou saúde.",
		),
});

/** A versão sugerida, com as trocas já validadas no servidor. */
export interface MealVariation {
	title: string;
	summary: string;
	swaps: RecipeSwap[];
}

export const suggestVariationInputSchema = z.object({
	mealId: z.uuid(),
	/** Combinações já sugeridas ("Aveia → Pão…"), pra não repetir. */
	avoid: z.array(z.string().max(600)).max(10),
});

const change = z.object({ itemId: z.uuid(), foodId: z.uuid() });

/** "Usar esta": só o par item → alimento (quantidade recalculada aqui). */
export const applyVariationInputSchema = z.object({
	mealId: z.uuid(),
	swaps: z.array(change).min(1).max(30),
});

/** "Desfazer": volta exatamente o que estava (alimento e quantidade). */
export const restoreVariationInputSchema = z.object({
	mealId: z.uuid(),
	items: z
		.array(change.extend({ quantity: z.number().positive().max(5000) }))
		.min(1)
		.max(30),
});

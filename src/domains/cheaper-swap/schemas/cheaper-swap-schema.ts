import { z } from "zod";

import type { Food } from "~/domains/food/types/food-types";

// O que a IA devolve: qual opção (código) e uma frase de por que combina.
export const aiCheaperSwapSchema = z.object({
	// Primeiro a escolha: a frase vem depois e fala dela.
	code: z
		.string()
		.describe('Código da opção escolhida, só da lista (ex.: "S2").'),
	insight: z
		.string()
		.describe(
			"Uma frase curta (até 110 caracteres) de por que essa troca vai bem nessa refeição. Sem valores em reais nem quantidades.",
		),
});

export const suggestCheaperSwapInputSchema = z.object({ itemId: z.uuid() });

/**
 * A sugestão pro item. A quantidade e a economia são recalculadas no
 * navegador (a pessoa pode mudar a quantidade com o painel aberto).
 */
export interface CheaperSwapSuggestion {
	food: Food;
	/** Frase da IA; null quando ela não respondeu (limite, erro). */
	insight: string | null;
}

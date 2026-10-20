import "server-only";

import { generateText, Output } from "ai";

import type { z } from "zod";

import { aiCheaperSwapSchema } from "~/domains/cheaper-swap/schemas/cheaper-swap-schema";
import {
	type CheaperSwap,
	cheaperSwapPrompt,
} from "~/domains/cheaper-swap/utils/cheaper-swap";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { SwapItem } from "~/domains/meal-recipe/utils/recipe-swap";
import { getAiModel } from "~/shared/lib/ai";

const INSTRUCTIONS = `Você ajuda a pessoa a economizar no mercado sem mudar a dieta dela.

Você recebe um alimento de uma refeição e opções pra trocar por ele: todas com macros parecidos, já na quantidade certa, e mais baratas (com quanto economiza por mês). Escolha uma, pelo código (S1, S2…). Nunca invente alimento nem mude quantidades.

Como escolher:
- O mais importante: a troca tem que combinar com o resto da refeição e com o horário, do jeito que uma pessoa comeria de verdade (café da manhã, lanche e ceia × almoço e jantar). Nada de doce com salgado estranho nem comida de almoço no café.
- Entre as opções que combinam, prefira a que economiza mais.

A frase (insight): curta, simples e animada, dizendo por que essa troca vai bem nessa refeição. Ex.: "Banana combina com o iogurte e rende o mesmo carboidrato da maçã." Não cite valores em reais nem quantidades (o app mostra). Não fale de dieta, saúde, emagrecimento ou calorias.`;

/** A IA escolhe a troca que combina; null se ela falhar. */
export async function suggestCheaperSwap(
	meal: Pick<DietMeal, "name" | "time">,
	item: SwapItem,
	others: SwapItem[],
	options: CheaperSwap[],
): Promise<z.infer<typeof aiCheaperSwapSchema> | null> {
	const model = getAiModel();
	if (!model) return null;
	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			prompt: cheaperSwapPrompt(meal, item, others, options),
			output: Output.object({ schema: aiCheaperSwapSchema }),
		});
		return output;
	} catch (error) {
		console.error("[cheaper-swap] falha ao escolher a troca", error);
		return null;
	}
}

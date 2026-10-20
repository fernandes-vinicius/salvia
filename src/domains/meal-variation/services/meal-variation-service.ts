import "server-only";

import { generateText, NoObjectGeneratedError, Output } from "ai";

import type { z } from "zod";

import type {
	PromptSwap,
	RecipeItem,
} from "~/domains/meal-recipe/utils/meal-recipe";
import { aiVariationSchema } from "~/domains/meal-variation/schemas/meal-variation-schema";
import { variationPrompt } from "~/domains/meal-variation/utils/meal-variation";
import {
	AI_NOT_CONFIGURED,
	AI_RATE_LIMITED,
	getAiModel,
	isRateLimited,
} from "~/shared/lib/ai";

const INSTRUCTIONS = `Você monta uma versão diferente de uma refeição de dieta, com os mesmos macros, trocando alimentos por equivalentes.

Como funciona:
- Cada alimento pode vir com "pode trocar por": opções com os macros quase iguais, já na quantidade certa. Você só escolhe quais trocas usar, pelos códigos (T1, T2…). Nunca invente alimento nem mude quantidades.
- Troque pelo menos 1 alimento; troque mais se ficar melhor. No máximo uma troca por alimento. Quem não for trocado continua igual.

O critério mais importante: o resultado tem que ser uma refeição que uma pessoa comeria de verdade, junta, naquele horário.
- Combine sabores que vão bem juntos e respeite o tipo de refeição (café da manhã, lanche e ceia × almoço e jantar). Ex.: aveia → pão integral numa ceia com leite e whey; arroz → batata-doce ou mandioca no almoço; frango → peixe ou carne.
- Proibido misturar doce com salgado de um jeito estranho (ovo com mel, carne com chocolate, peixe com fruta doce) ou pôr comida de almoço no café da manhã sem sentido (feijão no lanche).
- Lanche e ceia continuam leves e práticos (sanduíche, tigela, shake, fruta); não viram prato de almoço. Arroz e feijão só no almoço e no jantar.
- Não troque só por trocar: prefira trocas que deixem a refeição gostosa e prática.
- Se já sugeri combinações (lista "Já sugeri"), faça uma diferente.

Título curto e apetitoso, que combine com o nome e o horário da refeição (nada de "jantar" numa ceia), sem "fit", "light", "saudável" ou "proteico". Resumo em uma frase simples de como comer. Título e resumo descrevem exatamente as trocas escolhidas e citam só alimentos da nova versão (os trocados e os que continuam); nada a mais, nem "de sobremesa". Pode citar temperos e água. Não fale de dieta, saúde, emagrecimento ou calorias.`;

export type SuggestVariationResult =
	| { ok: true; variation: z.infer<typeof aiVariationSchema> }
	| { ok: false; error: string };

/** Uma combinação de trocas pra refeição, diferente das de `avoid`. */
export async function suggestMealVariation(
	meal: { name: string; time: string | null },
	items: (RecipeItem & { swaps?: PromptSwap[] })[],
	avoid: string[],
): Promise<SuggestVariationResult> {
	const model = getAiModel();
	if (!model) return { ok: false, error: AI_NOT_CONFIGURED };

	const prompt = [
		variationPrompt(meal, items),
		...(avoid.length > 0
			? ["", "Já sugeri:", ...avoid.map((entry) => `- ${entry}`)]
			: []),
	].join("\n");

	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			prompt,
			temperature: 1,
			output: Output.object({ schema: aiVariationSchema }),
		});
		return { ok: true, variation: output };
	} catch (error) {
		console.error("[meal-variation] falha ao variar refeição", error);
		if (isRateLimited(error)) return { ok: false, error: AI_RATE_LIMITED };
		if (NoObjectGeneratedError.isInstance(error)) {
			return { ok: false, error: "Não saiu uma boa versão. Tente de novo." };
		}
		return {
			ok: false,
			error: "Não foi possível variar agora. Tente de novo.",
		};
	}
}

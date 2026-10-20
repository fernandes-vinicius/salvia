import "server-only";

import { generateText, NoObjectGeneratedError, Output } from "ai";
import type { z } from "zod";

import { aiMealFillSchema } from "~/domains/meal-fill/schemas/meal-fill-schema";
import {
	AI_NOT_CONFIGURED,
	AI_RATE_LIMITED,
	getAiModel,
	isRateLimited,
} from "~/shared/lib/ai";

const INSTRUCTIONS = `Você completa uma refeição de dieta com o que falta pra meta do dia.

Como funciona:
- Você recebe a refeição (nome, horário e o que ela já tem), quanto falta no dia e uma lista de alimentos com códigos (F1, F2…). Escolha de 1 a 3 alimentos da lista, um pra cada macro que falta (proteína, carboidrato, gordura). As quantidades são calculadas depois: você só escolhe.
- Nunca invente alimento fora da lista.

O critério mais importante: o resultado tem que ser algo que uma pessoa comeria de verdade, junto com o que a refeição já tem, naquele horário.
- Respeite o tipo de refeição: café da manhã, lanche e ceia são leves e práticos (pão, fruta, iogurte, leite, ovo, aveia); almoço e jantar podem ter prato (arroz, feijão, carne, batata).
- Combine sabores que vão bem juntos. Proibido misturar doce com salgado de um jeito estranho (ovo com fruta doce, carne com iogurte).
- Prefira alimentos simples e comuns.
- Se já sugeri combinações (lista "Já sugeri"), faça uma diferente.

Título curto e apetitoso, sem "fit", "light", "saudável" ou "proteico", citando só os alimentos escolhidos. Resumo em uma frase simples de como comer junto. Não fale de dieta, saúde, emagrecimento ou calorias.`;

export type SuggestMealFillResult =
	| { ok: true; fill: z.infer<typeof aiMealFillSchema> }
	| { ok: false; error: string };

export async function suggestMealFill(
	prompt: string,
): Promise<SuggestMealFillResult> {
	const model = getAiModel();
	if (!model) return { ok: false, error: AI_NOT_CONFIGURED };

	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			prompt,
			temperature: 1,
			output: Output.object({ schema: aiMealFillSchema }),
		});
		return { ok: true, fill: output };
	} catch (error) {
		console.error("[meal-fill] falha ao completar refeição", error);
		if (isRateLimited(error)) return { ok: false, error: AI_RATE_LIMITED };
		if (NoObjectGeneratedError.isInstance(error)) {
			return { ok: false, error: "Não saiu uma boa sugestão. Tente de novo." };
		}
		return {
			ok: false,
			error: "Não foi possível completar agora. Tente de novo.",
		};
	}
}

import "server-only";

import { generateText, NoObjectGeneratedError, Output } from "ai";

import type { z } from "zod";

import { aiRecipeSchema } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import {
	mealPrompt,
	type PromptSwap,
	type RecipeItem,
	type RecipeStyle,
	recipeStylePrompt,
} from "~/domains/meal-recipe/utils/meal-recipe";
import { MAX_RECIPE_SWAPS } from "~/domains/meal-recipe/utils/recipe-swap";
import {
	AI_NOT_CONFIGURED,
	AI_RATE_LIMITED,
	getAiModel,
	isRateLimited,
} from "~/shared/lib/ai";

const INSTRUCTIONS = `Você sugere receitas caseiras e práticas pra uma refeição de uma dieta, usando SÓ os alimentos dela.

Regras obrigatórias:
- Use TODOS os alimentos da refeição, nas quantidades exatas informadas. Não tire e não aumente nenhum. Se algum não combinar com a receita, sirva "à parte" no último passo.
- Trocas: alguns alimentos vêm com "pode trocar por" (opções com os macros quase iguais, já na quantidade certa). Troque só quando isso deixar a receita bem mais gostosa e continuar combinando com o tipo de refeição (ex.: 200 g de mamão → 90 g de banana numa panqueca de café da manhã; arroz → batata-doce num assado no almoço). Nunca troque só pra variar nem algo que destoe da refeição e do horário (arroz e feijão só no almoço e no jantar; pão por arroz no café da manhã, nunca). No máximo ${MAX_RECIPE_SWAPS} trocas, só da lista, sem inventar outra nem mudar a quantidade. Ao trocar, o alimento original sai e entra o novo; ponha o código em "swaps", mas nunca escreva os códigos (T1, T2…) no título, no resumo nem nos passos. Na dúvida, não troque.
- Proibido acrescentar qualquer coisa com calorias: óleo, azeite, manteiga, margarina, açúcar, mel, melado, queijo, requeijão, creme de leite, leite condensado, leite a mais, iogurte, farinhas, pães, molhos prontos, chocolate, granola, castanhas, amendoim, coco, frutas a mais.
- Gordura pra cozinhar só se já estiver na refeição. Senão: frigideira antiaderente, forno, air fryer, cozido ou vapor.
- Pode acrescentar à vontade (não muda os macros): sal, temperos secos, ervas, alho, cebola, pimenta, limão, vinagre, folhas, legumes sem amido (tomate, abobrinha, pepino, cenoura, brócolis, couve…), água, gelo, café ou chá sem açúcar, adoçante zero, canela, essência de baunilha.
- Pense no que dá pra fazer de diferente com esses alimentos (ex.: whey + banana + leite + aveia → shake ou panqueca; arroz + frango + legumes → arroz de forno ou bowl).
- Prática: até uns 20 minutos, utensílios comuns, linguagem simples e direta, passos curtos.
- Nos passos, prefira medidas caseiras quando ajudar ("4 ovos", "1 banana") em vez de gramas.
- Não fale de dieta, saúde, emagrecimento ou calorias, nem use "fit", "light", "saudável" ou "proteico" no título.`;

export type SuggestRecipeResult =
	| { ok: true; recipe: z.infer<typeof aiRecipeSchema> }
	| { ok: false; error: string };

/**
 * Uma receita com os alimentos da refeição (ou as trocas oferecidas em
 * `swaps`), diferente das de `avoid`.
 */
export async function suggestMealRecipe(
	meal: { name: string; time: string | null },
	items: (RecipeItem & { swaps?: PromptSwap[] })[],
	avoid: string[],
	style: RecipeStyle | null = null,
): Promise<SuggestRecipeResult> {
	const model = getAiModel();
	if (!model) return { ok: false, error: AI_NOT_CONFIGURED };

	const prompt = [
		`Refeição: ${meal.name}${meal.time ? ` (${meal.time})` : ""}`,
		"Alimentos da refeição:",
		mealPrompt(items),
		...(style ? ["", recipeStylePrompt(style)] : []),
		...(avoid.length > 0
			? [
					"",
					"Já sugeri estas, faça uma bem diferente:",
					...avoid.map((title) => `- ${title}`),
				]
			: []),
	].join("\n");

	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			prompt,
			temperature: 1,
			output: Output.object({ schema: aiRecipeSchema }),
		});
		return {
			ok: true,
			recipe: {
				...output,
				minutes: Math.max(1, Math.round(output.minutes)),
				extras: output.extras.slice(0, 8),
				steps: output.steps.slice(0, 6),
				swaps: output.swaps.slice(0, MAX_RECIPE_SWAPS),
			},
		};
	} catch (error) {
		console.error("[meal-recipe] falha ao sugerir receita", error);
		if (isRateLimited(error)) return { ok: false, error: AI_RATE_LIMITED };
		if (NoObjectGeneratedError.isInstance(error)) {
			return { ok: false, error: "Não saiu uma receita boa. Tente de novo." };
		}
		return {
			ok: false,
			error: "Não foi possível sugerir agora. Tente de novo.",
		};
	}
}

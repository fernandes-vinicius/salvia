import { z } from "zod";

import { MAX_ITEM_OPTIONS } from "~/domains/diet/utils/diet";

// O que a IA devolve ao ler o documento (saída estruturada). As descrições
// vão pro modelo junto com o schema.
const readFood = z.object({
	text: z
		.string()
		.describe(
			'O item exatamente como está escrito, ex.: "4 colheres de sopa de arroz".',
		),
	food: z
		.string()
		.describe(
			'Nome simples do alimento em português, como numa tabela de composição: alimento + parte + preparo, sem marca nem quantidade. Ex.: "arroz branco cozido", "frango peito grelhado", "pão francês", "banana prata".',
		),
	grams: z
		.number()
		.nullable()
		.describe(
			"Peso (ou ml, se for líquido) da porção. Se estiver em medida caseira, converta pela média brasileira (1 colher de sopa de arroz cozido ≈ 25 g, 1 concha de feijão ≈ 140 g, 1 fatia de pão de forma ≈ 25 g, 1 ovo ≈ 50 g, 1 banana ≈ 70 g). Null só se não der pra estimar.",
		),
	units: z
		.number()
		.nullable()
		.describe(
			'Quantidade de unidades quando o item é contável ("2 ovos" → 2, "1 banana" → 1); senão null.',
		),
});

export const extractedDietSchema = z.object({
	meals: z
		.array(
			z.object({
				name: z
					.string()
					.describe('Nome da refeição, ex.: "Café da manhã", "Almoço".'),
				time: z
					.string()
					.nullable()
					.describe("Horário no formato HH:MM (24 h), ou null se não tiver."),
				items: z.array(
					readFood.extend({
						options: z
							.array(readFood)
							.describe(
								'Substituições que o documento lista pro item ("ou 100 g de cuscuz"). Vazio se não houver.',
							),
					}),
				),
			}),
		)
		.describe(
			"Refeições na ordem do documento. Vazio se o documento não for uma dieta.",
		),
});

export type ExtractedDiet = z.infer<typeof extractedDietSchema>;

// O que a tela de revisão manda salvar, depois de a pessoa conferir.
const quantity = z.number().positive().max(5000);
const portion = z.object({ foodId: z.uuid(), quantity });

export const importedDietInputSchema = z.object({
	meals: z
		.array(
			z.object({
				name: z.string().trim().min(1).max(40),
				time: z
					.string()
					.regex(/^([01]\d|2[0-3]):[0-5]\d$/)
					.nullable(),
				items: z
					.array(
						portion.extend({
							options: z.array(portion).max(MAX_ITEM_OPTIONS),
						}),
					)
					.max(40),
			}),
		)
		.min(1)
		.max(12),
});

export type ImportedDietInput = z.infer<typeof importedDietInputSchema>;

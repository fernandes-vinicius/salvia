import { z } from "zod";

import {
	isUnsplashImage,
	type RecipePhoto,
} from "~/domains/meal-recipe/utils/recipe-photo";

// O que a IA devolve (saída estruturada). Os ingredientes da refeição não
// vêm daqui: a tela mostra os da própria dieta, então os macros não mudam.
export const aiRecipeSchema = z.object({
	title: z
		.string()
		.describe('Nome curto e apetitoso, ex.: "Shake de banana com canela".'),
	summary: z
		.string()
		.describe(
			"Uma frase sobre o que é a receita (textura, sabor, como comer).",
		),
	minutes: z
		.number()
		.describe("Tempo total aproximado de preparo, em minutos."),
	extras: z
		.array(
			z.object({
				name: z.string().describe('Ex.: "Canela", "Gelo", "Cebola".'),
				amount: z.string().describe('Ex.: "1 pitada", "4 cubos", "a gosto".'),
			}),
		)
		.describe(
			"Só o que NÃO muda os macros: temperos, ervas, folhas, legumes sem amido, água, gelo, café/chá sem açúcar, adoçante zero. Vazio se não precisar.",
		),
	steps: z
		.array(z.string())
		.describe(
			"De 1 a 6 passos curtos, na ordem, com os alimentos e quantidades da refeição.",
		),
	tip: z
		.string()
		.nullable()
		.describe(
			"Uma dica prática curta (variação de tempero, como servir), ou null.",
		),
	imageQuery: z
		.string()
		.describe(
			'Termo de busca de foto EM INGLÊS, 2 ou 3 palavras, só do prato principal pronto, sem acompanhamentos (ex.: "banana smoothie", "chicken rice bowl", "scrambled eggs").',
		),
});

/** A receita como a tela mostra: o texto da IA + a foto ilustrativa. */
export type MealRecipe = Omit<z.infer<typeof aiRecipeSchema>, "imageQuery"> & {
	photo: RecipePhoto | null;
};

export const suggestRecipeInputSchema = z.object({
	mealId: z.uuid(),
	/** Títulos já sugeridos, pra não repetir. */
	avoid: z.array(z.string().max(120)).max(10),
});

// Receita vinda do client pra salvar: mesma forma, com limites de tamanho.
const text = (max: number) => z.string().trim().min(1).max(max);
export const recipeInputSchema = z.object({
	title: text(120),
	summary: text(300),
	// A IA pode mandar 0 ou fração: normaliza em vez de recusar.
	minutes: z
		.number()
		.transform((value) => Math.min(240, Math.max(1, Math.round(value)))),
	extras: z.array(z.object({ name: text(60), amount: text(60) })).max(12),
	steps: z.array(text(400)).min(1).max(8),
	tip: z.string().trim().max(300).nullable(),
	photo: z
		.object({
			url: z.string().max(600).refine(isUnsplashImage),
			alt: z.string().max(300),
			authorName: text(120),
			authorUrl: z.string().max(400).startsWith("https://unsplash.com/"),
			photoUrl: z.string().max(400).startsWith("https://unsplash.com/"),
			downloadLocation: z
				.string()
				.max(400)
				.startsWith("https://api.unsplash.com/"),
		})
		.nullable()
		.default(null),
});

export const saveRecipeInputSchema = z.object({
	mealId: z.uuid(),
	recipe: recipeInputSchema,
});

export const restoreRecipeInputSchema = recipeInputSchema.extend({
	id: z.uuid(),
	mealId: z.uuid().nullable(),
	mealName: text(40),
	ingredients: z
		.array(
			z.object({
				foodId: z.string().max(64),
				name: text(200),
				unit: z.enum(["g", "ml", "unit"]),
				quantity: z.number().positive().max(5000),
			}),
		)
		.max(40),
	macros: z.object({
		proteinAnimal: z.number().min(0),
		proteinVegetal: z.number().min(0),
		carbs: z.number().min(0),
		fat: z.number().min(0),
	}),
	createdAt: z.iso.datetime(),
});

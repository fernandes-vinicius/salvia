import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import {
	mealPrompt,
	recipeStylePrompt,
	recipeText,
	safeExtras,
} from "~/domains/meal-recipe/utils/meal-recipe";

const food = (name: string, unit: Food["unit"] = "g"): Food => ({
	id: name,
	source: "taco",
	name,
	category: null,
	unit,
	protein: 10,
	carbs: 10,
	fat: 1,
	fiber: 0,
	proteinSource: "vegetal",
});

const shake = [
	{ food: food("Whey protein"), quantity: 30 },
	{ food: food("Banana, prata, crua"), quantity: 100 },
	{ food: food("Leite, de vaca, integral", "ml"), quantity: 200 },
	{ food: food("Ovo, de galinha", "unit"), quantity: 1.5 },
];

describe("mealPrompt", () => {
	it("lista cada alimento com a quantidade e a unidade", () => {
		expect(mealPrompt(shake)).toBe(
			[
				"- Whey protein — 30 g (≈ 1 dose (scoop))",
				"- Banana, prata, crua — 100 g (≈ 1,5 unidades médias)",
				"- Leite, de vaca, integral — 200 ml (≈ 1 copo (200 ml))",
				"- Ovo, de galinha — 1,5 un",
			].join("\n"),
		);
	});

	it("lista as trocas possíveis com o código embaixo do alimento", () => {
		expect(
			mealPrompt([
				{
					...shake[1],
					swaps: [
						{ code: "T1", food: food("Maçã, Fuji, crua"), quantity: 155 },
						{ code: "T2", food: food("Manga, Palmer, crua"), quantity: 120 },
					],
				},
				shake[0],
			]),
		).toBe(
			[
				"- Banana, prata, crua — 100 g (≈ 1,5 unidades médias)",
				"  pode trocar por: T1 = Maçã, Fuji, crua — 155 g; T2 = Manga, Palmer, crua — 120 g",
				"- Whey protein — 30 g (≈ 1 dose (scoop))",
			].join("\n"),
		);
	});
});

describe("mealPrompt com medida caseira", () => {
	it('junta a medida caseira pra IA escrever "2 ovos" em vez de gramas', () => {
		expect(
			mealPrompt([
				{
					food: food("Ovo, de galinha, inteiro, cozido/10minutos"),
					quantity: 100,
				},
			]),
		).toBe(
			"- Ovo, de galinha, inteiro, cozido/10minutos — 100 g (≈ 2 unidades médias)",
		);
	});
});

describe("safeExtras", () => {
	const extras = (...names: string[]) =>
		names.map((name) => ({ name, amount: "a gosto" }));

	it("mantém temperos, folhas, legumes e bebidas sem caloria", () => {
		const kept = extras("Canela", "Gelo", "Sal e pimenta", "Tomate", "Alface");
		expect(safeExtras(kept, shake)).toEqual(kept);
	});

	it("tira o que tem caloria relevante", () => {
		const result = safeExtras(
			extras("Azeite", "Mel", "Queijo ralado", "Açúcar", "Manteiga", "Canela"),
			shake,
		);
		expect(result.map((extra) => extra.name)).toEqual(["Canela"]);
	});

	it("aceita o que já está na refeição", () => {
		const result = safeExtras(extras("Leite"), shake);
		expect(result.map((extra) => extra.name)).toEqual(["Leite"]);
	});

	it("tira repetidos sem diferenciar maiúsculas", () => {
		expect(safeExtras(extras("Gelo", "gelo"), shake)).toHaveLength(1);
	});
});

describe("recipeText", () => {
	it("monta título, ingredientes, extras e passos numerados", () => {
		const text = recipeText(
			{
				title: "Shake de banana",
				summary: "Cremoso e gelado.",
				minutes: 5,
				extras: [{ name: "Gelo", amount: "4 cubos" }],
				steps: ["Bata tudo.", "Sirva gelado."],
				tip: null,
				photo: null,
			},
			shake.slice(0, 2),
		);
		expect(text).toBe(
			[
				"*Shake de banana* (5 min)",
				"Cremoso e gelado.",
				"",
				"Ingredientes:",
				"- 30 g de Whey protein",
				"- 100 g de Banana, prata, crua",
				"- Gelo: 4 cubos",
				"",
				"Modo de preparo:",
				"1. Bata tudo.",
				"2. Sirva gelado.",
			].join("\n"),
		);
	});

	it("avisa o que a troca substituiu", () => {
		const text = recipeText(
			{
				title: "Vitamina",
				summary: "Gelada.",
				minutes: 5,
				extras: [],
				steps: ["Bata tudo."],
				tip: null,
				photo: null,
			},
			[
				{
					food: food("Banana, prata, crua"),
					quantity: 90,
					replaces: { food: food("Mamão, Formosa, cru"), quantity: 200 },
				},
			],
		);
		expect(text).toContain(
			"- 90 g de Banana, prata, crua (no lugar de 200 g de Mamão, Formosa, cru)",
		);
	});
});

describe("recipeStylePrompt", () => {
	it("cada estilo vira uma instrução pro prompt", () => {
		expect(recipeStylePrompt("rapida")).toContain("10 minutos");
		expect(recipeStylePrompt("marmita")).toContain("marmita");
		expect(recipeStylePrompt("airfryer")).toContain("air fryer");
	});

	it("sem estilo, nada", () => {
		expect(recipeStylePrompt(null)).toBeNull();
	});
});

import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import {
	mealPrompt,
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
				"- Whey protein — 30 g",
				"- Banana, prata, crua — 100 g",
				"- Leite, de vaca, integral — 200 ml",
				"- Ovo, de galinha — 1,5 un",
			].join("\n"),
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
});

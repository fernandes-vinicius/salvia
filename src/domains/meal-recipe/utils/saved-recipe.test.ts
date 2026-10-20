import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import {
	mealChangedSince,
	recipeSnapshot,
} from "~/domains/meal-recipe/utils/saved-recipe";

const food = (id: string, unit: Food["unit"] = "g"): Food => ({
	id,
	source: "taco",
	name: `Nome ${id}`,
	category: null,
	unit,
	protein: 10,
	carbs: 20,
	fat: 5,
	fiber: 2,
	proteinSource: id === "frango" ? "animal" : "vegetal",
});

const items = [
	{ food: food("frango"), quantity: 150 },
	{ food: food("arroz"), quantity: 100 },
];

describe("recipeSnapshot", () => {
	it("guarda nome, unidade e quantidade de cada alimento", () => {
		expect(recipeSnapshot(items).ingredients).toEqual([
			{ foodId: "frango", name: "Nome frango", unit: "g", quantity: 150 },
			{ foodId: "arroz", name: "Nome arroz", unit: "g", quantity: 100 },
		]);
	});

	it("guarda os macros somados da refeição", () => {
		expect(recipeSnapshot(items).macros).toEqual({
			proteinAnimal: 15,
			proteinVegetal: 10,
			carbs: 50,
			fat: 12.5,
		});
	});
});

describe("recipeSnapshot com troca", () => {
	it("guarda o alimento novo e o que ele substituiu, com os macros novos", () => {
		const snapshot = recipeSnapshot([
			{
				food: food("batata"),
				quantity: 50,
				replaces: { food: food("arroz"), quantity: 100 },
			},
		]);
		expect(snapshot.ingredients).toEqual([
			{
				foodId: "batata",
				name: "Nome batata",
				unit: "g",
				quantity: 50,
				replaces: {
					foodId: "arroz",
					name: "Nome arroz",
					unit: "g",
					quantity: 100,
				},
			},
		]);
		expect(snapshot.macros.carbs).toBe(10);
	});
});

describe("mealChangedSince", () => {
	const saved = recipeSnapshot(items).ingredients;

	it("mesma refeição, em qualquer ordem, não mudou", () => {
		expect(mealChangedSince(saved, [...items].reverse())).toBe(false);
	});

	it("quantidade diferente mudou", () => {
		expect(
			mealChangedSince(saved, [items[0], { ...items[1], quantity: 120 }]),
		).toBe(true);
	});

	it("compara a troca pelo alimento que estava na dieta", () => {
		const swapped = recipeSnapshot([
			items[0],
			{
				food: food("batata"),
				quantity: 50,
				replaces: { food: food("arroz"), quantity: 100 },
			},
		]).ingredients;
		expect(mealChangedSince(swapped, items)).toBe(false);
	});

	it("alimento a mais ou a menos mudou", () => {
		expect(mealChangedSince(saved, [items[0]])).toBe(true);
		expect(
			mealChangedSince(saved, [
				...items,
				{ food: food("ovo", "unit"), quantity: 2 },
			]),
		).toBe(true);
	});
});

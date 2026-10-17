import { describe, expect, it } from "vitest";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	mealMacros,
	nextMealName,
	summarizeDiet,
} from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food/types/food-types";

function food(
	name: string,
	values: Pick<Food, "protein" | "carbs" | "fat" | "proteinSource">,
	unit: Food["unit"] = "g",
): Food {
	return { id: name, source: "custom", name, category: null, unit, ...values };
}

// Por 100 g (unidade no pão), escolhidos pra reproduzir a planilha.
const frango = food("Frango", {
	protein: 32,
	carbs: 0,
	fat: 4,
	proteinSource: "animal",
});
const arroz = food("Arroz", {
	protein: 2,
	carbs: 28,
	fat: 0,
	proteinSource: "vegetal",
});
const pao = food(
	"Pão",
	{ protein: 2, carbs: 12, fat: 1.5, proteinSource: "vegetal" },
	"unit",
);

const meals: DietMeal[] = [
	{
		id: "m1",
		name: "Refeição 1",
		time: "12:00",
		items: [
			{ id: "i1", quantity: 100, food: frango },
			{ id: "i2", quantity: 100, food: arroz },
		],
	},
	{
		id: "m2",
		name: "Refeição 2",
		time: null,
		items: [{ id: "i3", quantity: 2, food: pao }],
	},
	{ id: "m3", name: "Refeição 3", time: null, items: [] },
];

describe("mealMacros", () => {
	it("soma os itens separando proteína animal e vegetal", () => {
		expect(mealMacros(meals[0])).toEqual({
			proteinAnimal: 32,
			proteinVegetal: 2,
			carbs: 28,
			fat: 4,
		});
	});
});

describe("summarizeDiet", () => {
	const summary = summarizeDiet(meals, { weightKg: 70, tdee: 2331 });

	it("calcula g, kcal, % e g/kg por macro", () => {
		// P(A) 32 · P(V) 6 · C 52 · G 7 → 128 + 24 + 208 + 63 = 423 kcal
		expect(summary.kcal).toBe(423);
		expect(summary.lines.proteinAnimal).toEqual({
			grams: 32,
			kcal: 128,
			percent: (128 * 100) / 423,
			perKg: 32 / 70,
		});
		expect(summary.lines.fat.kcal).toBe(63);
	});

	it("excedente = planejado − gasto (negativo é déficit)", () => {
		expect(summary.surplus).toBe(423 - 2331);
	});

	it("sem TMB preenchida não há excedente nem g/kg", () => {
		const empty = summarizeDiet(meals, { weightKg: null, tdee: null });
		expect(empty.surplus).toBeNull();
		expect(empty.lines.carbs.perKg).toBeNull();
	});

	it("dia vazio não divide por zero", () => {
		const empty = summarizeDiet([], { weightKg: 70, tdee: 2000 });
		expect(empty.kcal).toBe(0);
		expect(empty.lines.carbs.percent).toBe(0);
	});
});

describe("nextMealName", () => {
	it("usa o próximo número livre", () => {
		expect(nextMealName(meals)).toBe("Refeição 4");
		expect(nextMealName([{ name: "Café" }, { name: "Refeição 2" }])).toBe(
			"Refeição 3",
		);
	});
});

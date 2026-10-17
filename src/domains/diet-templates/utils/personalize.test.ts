import { describe, expect, it } from "vitest";

import type { ResolvedTemplateMeal } from "~/domains/diet-templates/types/diet-template-types";
import { personalizeTemplate } from "~/domains/diet-templates/utils/personalize";
import type { Food } from "~/domains/food/types/food-types";
import { macrosFor, sumMacros } from "~/domains/food/utils/food";

function food(
	name: string,
	values: Pick<Food, "protein" | "carbs" | "fat" | "proteinSource">,
): Food {
	return {
		id: name,
		source: "taco",
		name,
		category: null,
		unit: "g",
		...values,
	};
}

const frango = food("Frango", {
	protein: 32,
	carbs: 0,
	fat: 2.5,
	proteinSource: "animal",
});
const arroz = food("Arroz", {
	protein: 2.5,
	carbs: 28,
	fat: 0.2,
	proteinSource: "vegetal",
});
const azeite = food("Azeite", {
	protein: 0,
	carbs: 0,
	fat: 100,
	proteinSource: "vegetal",
});
const alface = food("Alface", {
	protein: 0,
	carbs: 0,
	fat: 0,
	proteinSource: "vegetal",
});

const meals: ResolvedTemplateMeal[] = [
	{
		name: "Almoço",
		time: "12:00",
		items: [
			{ food: frango, quantity: 150 },
			{ food: arroz, quantity: 150 },
			{ food: azeite, quantity: 10 },
			{ food: alface, quantity: 60 },
		],
	},
];

function dayTotals(list: ResolvedTemplateMeal[]) {
	return sumMacros(
		list.flatMap((meal) =>
			meal.items.map((item) => macrosFor(item.food, item.quantity)),
		),
	);
}

describe("personalizeTemplate", () => {
	it("sem metas devolve o modelo como está", () => {
		expect(personalizeTemplate(meals, null)).toBe(meals);
	});

	it("escala cada grupo pra bater as três metas juntas", () => {
		const goal = { protein: 96, carbs: 84, fat: 25 };
		const totals = dayTotals(personalizeTemplate(meals, goal));
		// Arredondamento de 5 g: fica a poucos gramas da meta.
		expect(totals.proteinAnimal).toBeCloseTo(goal.protein, -1);
		expect(totals.carbs).toBeCloseTo(goal.carbs, -1);
		expect(totals.fat).toBeCloseTo(goal.fat, -1);
	});

	it("mantém alimentos sem macros e arredonda no passo do editor", () => {
		const [meal] = personalizeTemplate(meals, {
			protein: 96,
			carbs: 84,
			fat: 25,
		});
		expect(meal.items.find((i) => i.food === alface)?.quantity).toBe(60);
		for (const item of meal.items) expect(item.quantity % 5).toBe(0);
	});
});

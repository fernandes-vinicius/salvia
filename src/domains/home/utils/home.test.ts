import { describe, expect, it } from "vitest";

import type { DietMeal, DietSummary } from "~/domains/diet/types/diet-types";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import type { CustomFoodSummary, Food } from "~/domains/food/types/food-types";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import {
	emptyMealItems,
	findNextMeal,
	planVerdict,
	suspiciousFoods,
	toMinutes,
} from "~/domains/home/utils/home";

const frango: Food = {
	id: "f",
	source: "taco",
	name: "Frango",
	category: null,
	unit: "g",
	protein: 32,
	carbs: 0,
	fat: 4,
	fiber: 0,
	proteinSource: "animal",
};

function meal(id: string, time: string | null, items = 0): DietMeal {
	return {
		id,
		name: `Refeição ${id}`,
		time,
		items: Array.from({ length: items }, (_, i) => ({
			id: `${id}-${i}`,
			quantity: 100,
			food: frango,
			options: [],
		})),
	};
}

describe("findNextMeal", () => {
	const meals = [
		meal("3", "15:00"),
		meal("1", "09:00"),
		meal("x", null),
		meal("2", "12:00"),
	];

	it("pega a próxima pelo horário", () => {
		expect(findNextMeal(meals, toMinutes("10:30"))?.meal.id).toBe("2");
		expect(findNextMeal(meals, toMinutes("12:00"))?.meal.id).toBe("2");
	});

	it("depois da última, volta pra primeira de amanhã", () => {
		expect(findNextMeal(meals, toMinutes("22:00"))).toMatchObject({
			meal: { id: "1" },
			tomorrow: true,
		});
	});

	it("null quando nenhuma refeição tem horário", () => {
		expect(findNextMeal([meal("a", null)], 600)).toBeNull();
	});
});

function targets(
	calories: number,
	p: number,
	c: number,
	f: number,
): GoalTargets {
	return {
		calories,
		protein: { grams: p, kcal: p * 4, perKg: 0 },
		carbs: { grams: c, kcal: c * 4, perKg: 0 },
		fat: { grams: f, kcal: f * 9, perKg: 0 },
		macroCalories: 0,
		calorieGap: 0,
		weeklyChangeKg: 0,
		warnings: [],
	};
}

describe("planVerdict", () => {
	// 300 g de frango: P 96 · G 12 → 384 + 108 = 492 kcal
	const summary: DietSummary = summarizeDiet([meal("1", null, 3)], {
		weightKg: 70,
		tdee: 2000,
	});

	it("fecha com a meta dentro da tolerância", () => {
		expect(planVerdict(summary, targets(500, 96, 0, 12)).status).toBe(
			"on-target",
		);
	});

	it("explica o que falta pelo macro mais distante", () => {
		const verdict = planVerdict(summary, targets(900, 96, 100, 12));
		expect(verdict.status).toBe("below");
		expect(verdict.message).toBe(
			"Faltam 408 kcal para a meta, principalmente carboidrato (−100 g).",
		);
	});

	it("plano vazio pede pra montar a dieta", () => {
		const empty = summarizeDiet([], { weightKg: 70, tdee: 2000 });
		expect(planVerdict(empty, targets(1800, 150, 150, 60)).status).toBe(
			"empty",
		);
	});
});

describe("suspiciousFoods", () => {
	const base = { ...frango, source: "custom" as const, usedInMeals: 1 };

	it("aponta proteína em pó com valor de dose", () => {
		const whey: CustomFoodSummary = {
			...base,
			id: "w",
			name: "whey protein",
			protein: 25,
			carbs: 2,
			fat: 1,
		};
		expect(suspiciousFoods([whey])[0]?.id).toBe("food-powder-w");
	});

	it("aponta macros impossíveis por 100 g", () => {
		const errado: CustomFoodSummary = {
			...base,
			id: "e",
			name: "Granola",
			protein: 40,
			carbs: 60,
			fat: 20,
		};
		expect(suspiciousFoods([errado])[0]?.id).toBe("food-impossible-e");
	});

	it("ignora alimentos ok e os medidos por unidade", () => {
		expect(
			suspiciousFoods([
				{
					...base,
					id: "ok",
					name: "Whey isolado",
					protein: 85,
					carbs: 3,
					fat: 1,
				},
				{
					...base,
					id: "u",
					name: "Whey dose",
					unit: "unit",
					protein: 25,
					carbs: 2,
					fat: 1,
				},
			]),
		).toEqual([]);
	});
});

describe("emptyMealItems", () => {
	it("só avisa refeições vazias quando o plano já tem comida", () => {
		expect(emptyMealItems([meal("1", null), meal("2", null)])).toEqual([]);
		expect(
			emptyMealItems([meal("1", null, 1), meal("2", null)]).map((i) => i.id),
		).toEqual(["meal-empty-2"]);
	});
});

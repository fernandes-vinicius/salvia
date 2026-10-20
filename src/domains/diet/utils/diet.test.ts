import { describe, expect, it } from "vitest";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	changedLayouts,
	equivalentQuantity,
	fiberTarget,
	isOnTarget,
	mealMacros,
	moveItemTo,
	nextMealName,
	summarizeDiet,
} from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food/types/food-types";

function food(
	name: string,
	values: Pick<Food, "protein" | "carbs" | "fat" | "proteinSource"> & {
		fiber?: number;
	},
	unit: Food["unit"] = "g",
): Food {
	return {
		id: name,
		source: "custom",
		name,
		category: null,
		unit,
		fiber: 0,
		...values,
	};
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
			{ id: "i1", quantity: 100, food: frango, options: [] },
			{ id: "i2", quantity: 100, food: arroz, options: [] },
		],
	},
	{
		id: "m2",
		name: "Refeição 2",
		time: null,
		items: [{ id: "i3", quantity: 2, food: pao, options: [] }],
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

describe("fibras", () => {
	it("soma a fibra por 100 g e por unidade, fora das kcal", () => {
		const feijao = food("Feijão", {
			protein: 4.8,
			carbs: 13.6,
			fat: 0.5,
			fiber: 8.5,
			proteinSource: "vegetal",
		});
		const torrada = food(
			"Torrada",
			{ protein: 1, carbs: 7, fat: 0.5, fiber: 0.5, proteinSource: "vegetal" },
			"unit",
		);
		const day: DietMeal[] = [
			{
				id: "m",
				name: "Almoço",
				time: null,
				items: [
					{ id: "a", quantity: 200, food: feijao, options: [] },
					{ id: "b", quantity: 4, food: torrada, options: [] },
				],
			},
		];
		const summary = summarizeDiet(day, { weightKg: null, tdee: null });
		expect(summary.fiber).toBeCloseTo(19);
		expect(summarizeDiet([], { weightKg: null, tdee: null }).fiber).toBe(0);
	});

	it("recomenda pelo menos 25 g ou 14 g a cada 1.000 kcal", () => {
		expect(fiberTarget(0)).toBe(25);
		expect(fiberTarget(1500)).toBe(25);
		expect(fiberTarget(2500)).toBe(35);
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

describe("moveItemTo / changedLayouts", () => {
	const ids = (list: DietMeal[]) =>
		list.map((m) => `${m.id}:${m.items.map((i) => i.id).join("")}`);

	it("reordena dentro da mesma refeição", () => {
		const moved = moveItemTo(meals, "i2", "m1", 0);
		expect(ids(moved)).toEqual(["m1:i2i1", "m2:i3", "m3:"]);
		expect(changedLayouts(meals, moved)).toEqual([
			{ mealId: "m1", itemIds: ["i2", "i1"] },
		]);
	});

	it("move pra outra refeição (inclusive vazia)", () => {
		const moved = moveItemTo(meals, "i1", "m3", 0);
		expect(ids(moved)).toEqual(["m1:i2", "m2:i3", "m3:i1"]);
		expect(changedLayouts(meals, moved)).toEqual([
			{ mealId: "m1", itemIds: ["i2"] },
			{ mealId: "m3", itemIds: ["i1"] },
		]);
	});

	it("limita o índice ao tamanho da refeição", () => {
		expect(ids(moveItemTo(meals, "i1", "m2", 99))).toEqual([
			"m1:i2",
			"m2:i3i1",
			"m3:",
		]);
	});

	it("sem mudança não gera layout", () => {
		expect(changedLayouts(meals, meals)).toEqual([]);
	});
});

describe("equivalentQuantity", () => {
	const batata = food("Batata", {
		protein: 1.2,
		carbs: 14,
		fat: 0,
		proteinSource: "vegetal",
	});

	it("troca pelo macro principal do item (arroz → batata no carboidrato)", () => {
		// 100 g de arroz = 28 g C → 200 g de batata.
		expect(equivalentQuantity({ quantity: 100, food: arroz }, batata)).toEqual({
			quantity: 200,
			macro: "carbs",
			grams: 28,
		});
	});

	it("arredonda ao passo da unidade (0,5)", () => {
		const ovo = food(
			"Ovo",
			{ protein: 6, carbs: 0.5, fat: 5, proteinSource: "animal" },
			"unit",
		);
		// 100 g de frango = 32 g P → 5,3 ovos → 5,5.
		expect(
			equivalentQuantity({ quantity: 100, food: frango }, ovo),
		).toMatchObject({ quantity: 5.5, macro: "protein" });
		// 2 pães = 24 g C → 1,7 un do pão com 14 g C → 1,5.
		expect(
			equivalentQuantity(
				{ quantity: 2, food: pao },
				{
					...pao,
					carbs: 14,
				},
			),
		).toMatchObject({ quantity: 1.5, macro: "carbs" });
	});

	it("sem o macro no alimento novo não sugere", () => {
		expect(
			equivalentQuantity({ quantity: 100, food: arroz }, frango),
		).toBeNull();
	});
});

describe("isOnTarget", () => {
	const targets = {
		calories: 2000,
		protein: { grams: 150 },
		carbs: { grams: 200 },
		fat: { grams: 67 },
	};
	const summaryWith = (
		kcal: number,
		p: number,
		c: number,
		f: number,
		vegetal = 0,
	) => ({
		kcal,
		fiber: 0,
		surplus: null,
		lines: {
			proteinAnimal: { grams: p, kcal: 0, percent: 0, perKg: null },
			proteinVegetal: { grams: vegetal, kcal: 0, percent: 0, perKg: null },
			carbs: { grams: c, kcal: 0, percent: 0, perKg: null },
			fat: { grams: f, kcal: 0, percent: 0, perKg: null },
		},
	});

	it("na meta quando tudo está dentro de ±3%", () => {
		expect(isOnTarget(summaryWith(2040, 148, 204, 66), targets, "animal")).toBe(
			true,
		);
	});

	it("fora quando qualquer linha passa da tolerância", () => {
		expect(isOnTarget(summaryWith(2000, 140, 200, 67), targets, "animal")).toBe(
			false,
		);
		expect(isOnTarget(summaryWith(2100, 150, 200, 67), targets, "animal")).toBe(
			false,
		);
	});

	it("no total, a proteína vegetal entra na conta", () => {
		// 120 g animal + 30 g vegetal = 150 g: bate no total, não no animal.
		const summary = summaryWith(2000, 120, 200, 67, 30);
		expect(isOnTarget(summary, targets, "total")).toBe(true);
		expect(isOnTarget(summary, targets, "animal")).toBe(false);
	});
});

import { describe, expect, it } from "vitest";

import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import { applyPlan, diffDraft } from "~/domains/diet/utils/diet-draft";
import type { Food } from "~/domains/food/types/food-types";

function food(id: string, name: string, unit: Food["unit"] = "g"): Food {
	return {
		id,
		source: "taco",
		name,
		category: null,
		unit,
		protein: 0,
		carbs: 0,
		fat: 0,
		fiber: 0,
		proteinSource: "animal",
	};
}

const rice = food("rice", "Arroz cozido");
const yogurt = food("yogurt", "Iogurte natural");
const whey = food("whey", "Whey protein");
const egg = food("egg", "Ovo", "unit");

const item = (id: string, f: Food, quantity: number): DietItem => ({
	id,
	food: f,
	quantity,
	options: [],
});

const base: DietMeal[] = [
	{
		id: "lunch",
		name: "Almoço",
		time: "12:30",
		items: [item("a1", rice, 100)],
	},
	{
		id: "snack",
		name: "Lanche",
		time: "16:00",
		items: [item("a2", yogurt, 170), item("a3", egg, 2)],
	},
	{ id: "supper", name: "Ceia", time: null, items: [] },
];

describe("diffDraft", () => {
	it("sem mudanças: nada a mostrar", () => {
		const draft: DietMeal[] = base.map((meal) => ({
			...meal,
			id: `d-${meal.id}`,
			sourceMealId: meal.id,
			items: meal.items.map((entry) => ({ ...entry, id: `d-${entry.id}` })),
		}));
		const diff = diffDraft(base, draft);
		expect(diff.count).toBe(0);
		expect(diff.groups).toEqual([]);
		expect(diff.items).toEqual({});
	});

	it("quantidade que mudou, alimento novo e alimento tirado", () => {
		const draft: DietMeal[] = [
			{
				id: "d-lunch",
				sourceMealId: "lunch",
				name: "Almoço",
				time: "12:30",
				items: [item("d1", rice, 150)],
			},
			{
				id: "d-snack",
				sourceMealId: "snack",
				name: "Lanche",
				time: "16:00",
				items: [item("d2", whey, 30), item("d3", egg, 2)],
			},
			{
				id: "d-supper",
				sourceMealId: "supper",
				name: "Ceia",
				time: null,
				items: [],
			},
		];
		const diff = diffDraft(base, draft);

		expect(diff.items).toEqual({
			d1: { kind: "changed", before: 100 },
			d2: { kind: "new" },
		});
		expect(diff.removed["d-snack"].map((entry) => entry.food.name)).toEqual([
			"Iogurte natural",
		]);
		expect(diff.groups).toEqual([
			{ meal: "Almoço", lines: ["Arroz cozido: 100 g → 150 g"] },
			{
				meal: "Lanche",
				lines: ["+ Whey protein 30 g", "− Iogurte natural 170 g"],
			},
		]);
		expect(diff.count).toBe(3);
	});

	it("nome e horário da refeição", () => {
		const draft: DietMeal[] = [
			{
				...base[0],
				id: "d-lunch",
				sourceMealId: "lunch",
				name: "Almoço pós-treino",
				time: "13:00",
			},
			{ ...base[1], id: "d-snack", sourceMealId: "snack" },
			{ ...base[2], id: "d-supper", sourceMealId: "supper" },
		];
		expect(diffDraft(base, draft).groups).toEqual([
			{
				meal: "Almoço pós-treino",
				lines: ["Nome: Almoço → Almoço pós-treino", "Horário: 12:30 → 13:00"],
			},
		]);
	});

	it("refeição nova e refeição tirada", () => {
		const draft: DietMeal[] = [
			{ ...base[0], id: "d-lunch", sourceMealId: "lunch" },
			{ ...base[1], id: "d-snack", sourceMealId: "snack" },
			{
				id: "d-new",
				sourceMealId: null,
				name: "Pré-treino",
				time: "18:00",
				items: [item("d9", rice, 80)],
			},
		];
		const diff = diffDraft(base, draft);
		expect(diff.items.d9).toEqual({ kind: "new" });
		expect(diff.groups).toEqual([
			{ meal: "Pré-treino", lines: ["Refeição nova", "+ Arroz cozido 80 g"] },
			{ meal: "Ceia", lines: ["Refeição tirada"] },
		]);
		expect(diff.count).toBe(3);
	});

	it("alimento repetido na refeição casa um por um", () => {
		const doubled: DietMeal[] = [
			{
				id: "m",
				name: "Almoço",
				time: null,
				items: [item("a", rice, 100), item("b", rice, 50)],
			},
		];
		const draft: DietMeal[] = [
			{
				id: "d",
				sourceMealId: "m",
				name: "Almoço",
				time: null,
				items: [item("x", rice, 100), item("y", rice, 60)],
			},
		];
		expect(diffDraft(doubled, draft).items).toEqual({
			y: { kind: "changed", before: 50 },
		});
	});
});

describe("applyPlan", () => {
	it("atualiza a refeição de origem no lugar, na ordem do rascunho", () => {
		expect(
			applyPlan(
				["a", "b", "c"],
				[
					{ id: "d-b", sourceMealId: "b" },
					{ id: "d-a", sourceMealId: "a" },
					{ id: "d-new", sourceMealId: null },
				],
			),
		).toEqual({
			update: [
				{ from: "d-b", into: "b", position: 0 },
				{ from: "d-a", into: "a", position: 1 },
			],
			promote: [{ id: "d-new", position: 2 }],
			remove: ["c"],
		});
	});

	it("origem que não existe mais (ou repetida) vira refeição nova", () => {
		expect(
			applyPlan(
				["a"],
				[
					{ id: "x", sourceMealId: "a" },
					{ id: "y", sourceMealId: "a" },
					{ id: "z", sourceMealId: "gone" },
				],
			),
		).toEqual({
			update: [{ from: "x", into: "a", position: 0 }],
			promote: [
				{ id: "y", position: 1 },
				{ id: "z", position: 2 },
			],
			remove: [],
		});
	});
});

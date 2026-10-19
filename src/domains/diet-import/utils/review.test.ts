import { describe, expect, it } from "vitest";

import type {
	ImportedMeal,
	ImportedPortion,
} from "~/domains/diet-import/types/diet-import-types";
import {
	editPortion,
	pendingCount,
	toImportInput,
} from "~/domains/diet-import/utils/review";
import type { Food } from "~/domains/food/types/food-types";

const food = (id: string): Food => ({
	id,
	source: "taco",
	name: id,
	category: null,
	unit: "g",
	protein: 10,
	carbs: 10,
	fat: 1,
	fiber: 0,
	proteinSource: "vegetal",
});

const portion = (key: string, found: Food | null): ImportedPortion => ({
	key,
	text: key,
	food: found,
	quantity: found ? 100 : 0,
	read: { grams: 100, units: null },
});

const meals = (): ImportedMeal[] => [
	{
		key: "m0",
		name: "Café",
		time: "07:00",
		items: [
			{ ...portion("p0", food("pao")), options: [portion("p1", null)] },
			{ ...portion("p2", null), options: [] },
		],
	},
	{ key: "m1", name: "Almoço", time: null, items: [] },
];

describe("pendingCount", () => {
	it("conta itens e opções sem alimento encontrado", () => {
		expect(pendingCount(meals())).toBe(2);
	});
});

describe("editPortion", () => {
	it("troca um item pelo caminho", () => {
		const next = editPortion(meals(), { meal: "m0", item: "p2" }, (p) => ({
			...p,
			food: food("arroz"),
			quantity: 150,
		}));
		expect(next[0].items[1].food?.id).toBe("arroz");
		expect(next[0].items[1].quantity).toBe(150);
		expect(pendingCount(next)).toBe(1);
	});

	it("troca uma opção do item", () => {
		const next = editPortion(
			meals(),
			{ meal: "m0", item: "p0", option: "p1" },
			(p) => ({ ...p, food: food("tapioca") }),
		);
		expect(next[0].items[0].options[0].food?.id).toBe("tapioca");
	});

	it("remove item ou opção quando a função devolve null", () => {
		const withoutItem = editPortion(
			meals(),
			{ meal: "m0", item: "p2" },
			() => null,
		);
		expect(withoutItem[0].items.map((i) => i.key)).toEqual(["p0"]);
		const withoutOption = editPortion(
			meals(),
			{ meal: "m0", item: "p0", option: "p1" },
			() => null,
		);
		expect(withoutOption[0].items[0].options).toEqual([]);
	});
});

describe("toImportInput", () => {
	it("leva só o que tem alimento e descarta refeições vazias", () => {
		expect(toImportInput(meals())).toEqual({
			meals: [
				{
					name: "Café",
					time: "07:00",
					items: [{ foodId: "pao", quantity: 100, options: [] }],
				},
			],
		});
	});

	it("limita as opções a 3 por item", () => {
		const many = meals();
		many[0].items[0].options = ["a", "b", "c", "d"].map((id) =>
			portion(id, food(id)),
		);
		const [meal] = toImportInput(many).meals;
		expect(meal.items[0].options.map((o) => o.foodId)).toEqual(["a", "b", "c"]);
	});
});

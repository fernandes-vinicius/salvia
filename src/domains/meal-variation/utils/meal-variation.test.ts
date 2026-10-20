import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import {
	variationKey,
	variationPrompt,
	variationTotals,
} from "~/domains/meal-variation/utils/meal-variation";

const food = (
	name: string,
	[protein, carbs, fat]: [number, number, number],
): Food => ({
	id: name,
	source: "taco",
	name,
	category: null,
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource: "vegetal",
});

const aveia = food("Aveia, flocos, crua", [13.9, 66.6, 8.5]);
const pao = food("Pão, trigo, forma, integral", [9.4, 49.9, 3.7]);
const leite = food("Leite, de vaca, integral, pó", [25.4, 39.2, 26.9]);
const items = [
	{ id: "i1", food: leite, quantity: 20 },
	{ id: "i2", food: aveia, quantity: 40 },
];
const swap = { itemId: "i2", food: pao, quantity: 55 };

describe("variationPrompt", () => {
	it("traz o nome, o horário e os alimentos com as trocas possíveis", () => {
		expect(
			variationPrompt({ name: "Ceia", time: "21:00" }, [
				{ ...items[0], swaps: [] },
				{ ...items[1], swaps: [{ code: "T1", food: pao, quantity: 55 }] },
			]),
		).toBe(
			[
				"Refeição: Ceia (21:00)",
				"Alimentos:",
				"- Leite, de vaca, integral, pó — 20 g (≈ 1,5 colheres de sopa)",
				"- Aveia, flocos, crua — 40 g (≈ 2,5 colheres de sopa)",
				"  pode trocar por: T1 = Pão, trigo, forma, integral — 55 g (≈ 2 fatias)",
			].join("\n"),
		);
	});

	it("sem horário, só o nome", () => {
		expect(
			variationPrompt({ name: "Lanche", time: null }, []).split("\n")[0],
		).toBe("Refeição: Lanche");
	});
});

describe("variationTotals", () => {
	it("soma os macros da refeição atual e da nova", () => {
		const { before, after } = variationTotals(items, [swap]);
		expect(before.carbs).toBeCloseTo(7.84 + 26.64);
		expect(after.carbs).toBeCloseTo(7.84 + 27.445);
		expect(after.fat).toBeCloseTo(5.38 + 2.035);
	});
});

describe("variationKey", () => {
	it('descreve a combinação pra não repetir em "Outra versão"', () => {
		expect(variationKey(items, [swap])).toBe(
			"Aveia, flocos, crua → Pão, trigo, forma, integral",
		);
	});
});

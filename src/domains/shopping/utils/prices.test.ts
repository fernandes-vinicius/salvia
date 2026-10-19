import { describe, expect, it } from "vitest";

import type { Price } from "~/domains/shopping/data/reference-prices";
import {
	itemCost,
	priceKey,
	priceUnitsFor,
	referencePrice,
	shoppingCost,
} from "~/domains/shopping/utils/prices";
import type { ShoppingGroup } from "~/domains/shopping/utils/shopping-list";

const grams = (value: number, count: number | null = null) => ({
	unit: "g" as const,
	value,
	count,
});

describe("referencePrice", () => {
	it("acha pelo nome (sem acento) e por palavra-chave", () => {
		expect(referencePrice("Peito de frango sem pele")).toEqual({
			value: 22,
			per: "kg",
		});
		expect(referencePrice("ACEM MOIDO")?.value).toBe(35);
		expect(referencePrice("Whey Isolado Baunilha")?.value).toBe(120);
		expect(referencePrice("Salada crua")).toBeNull();
	});
});

describe("itemCost", () => {
	it("por kg, unidade e dúzia", () => {
		expect(itemCost(grams(1500), { value: 22, per: "kg" })).toBeCloseTo(33);
		expect(itemCost(grams(700, 14), { value: 10, per: "dz" })).toBeCloseTo(
			11.67,
		);
		expect(itemCost(grams(700, 14), { value: 0.8, per: "un" })).toBeCloseTo(
			11.2,
		);
	});

	it("null quando o preço não combina com o item", () => {
		expect(itemCost(grams(500), { value: 1, per: "un" })).toBeNull();
		expect(
			itemCost({ unit: "unit", value: 3, count: 3 }, { value: 5, per: "kg" }),
		).toBeNull();
	});
});

describe("priceUnitsFor", () => {
	it("oferece só as unidades que fazem sentido", () => {
		expect(priceUnitsFor(grams(500))).toEqual(["kg"]);
		expect(priceUnitsFor(grams(700, 14))).toEqual(["kg", "un", "dz"]);
		expect(priceUnitsFor({ unit: "ml", value: 200, count: null })).toEqual([
			"L",
		]);
	});
});

describe("shoppingCost", () => {
	const groups: ShoppingGroup[] = [
		{
			section: "Mercearia",
			items: [
				{
					key: "rule:Arroz",
					name: "Arroz",
					amount: "",
					detail: null,
					quantity: grams(1000),
				},
				{
					key: "food:x",
					name: "Salada crua",
					amount: "",
					detail: null,
					quantity: grams(700),
				},
			],
		},
	];

	it("soma com o preço de referência e conta os sem preço", () => {
		const cost = shoppingCost(groups, new Map());
		expect(cost.total).toBeCloseTo(6);
		expect(cost.missing).toBe(1);
		expect(cost.byItem.get("rule:Arroz")?.source).toBe("reference");
	});

	it("o preço do usuário vence a referência", () => {
		const user = new Map<string, Price>([
			[priceKey("Arroz"), { value: 5, per: "kg" }],
			[priceKey("Salada crua"), { value: 10, per: "kg" }],
		]);
		const cost = shoppingCost(groups, user);
		expect(cost.total).toBeCloseTo(12);
		expect(cost.missing).toBe(0);
		expect(cost.byItem.get("rule:Arroz")?.source).toBe("user");
	});
});

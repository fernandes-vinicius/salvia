import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import type { Price } from "~/domains/shopping/data/reference-prices";
import {
	costChangeLabel,
	costChangeShort,
	itemCost,
	portionCost,
	priceKey,
	priceUnitsFor,
	referencePrice,
	shoppingCost,
	swapCost,
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

describe("portionCost e swapCost", () => {
	const food = (name: string): Food => ({
		id: name,
		source: "taco",
		name,
		category: "Frutas e derivados",
		unit: "g",
		protein: 1,
		carbs: 20,
		fat: 0,
		fiber: 2,
		proteinSource: "vegetal",
	});
	const noPrices = new Map<string, Price>();

	it("custo de uma porção pelo preço de referência (do que se compra)", () => {
		// Banana-prata R$ 7/kg: 200 g = R$ 1,40.
		expect(portionCost(food("Banana, prata, crua"), 200, noPrices)).toBeCloseTo(
			1.4,
		);
		expect(portionCost(food("Fruta rara"), 200, noPrices)).toBeNull();
	});

	it("o preço da pessoa vence a referência", () => {
		const prices = new Map<string, Price>([
			[priceKey("Banana-prata"), { value: 10, per: "kg" }],
		]);
		expect(portionCost(food("Banana, prata, crua"), 200, prices)).toBeCloseTo(
			2,
		);
	});

	it("diferença por dia entre o que sai e o que entra", () => {
		const cost = swapCost(
			{ food: food("Banana, prata, crua"), quantity: 200 },
			{ food: food("Mamão, Papaia, cru"), quantity: 300 },
			noPrices,
		);
		// R$ 1,40 → R$ 2,70.
		expect(cost?.before).toBeCloseTo(1.4);
		expect(cost?.after).toBeCloseTo(2.7);
		expect(cost?.delta).toBeCloseTo(1.3);
	});

	it("sem preço de um dos lados, null", () => {
		expect(
			swapCost(
				{ food: food("Banana, prata, crua"), quantity: 200 },
				{ food: food("Fruta rara"), quantity: 100 },
				noPrices,
			),
		).toBeNull();
	});

	it("texto da diferença em linguagem simples", () => {
		expect(costChangeLabel(1.3)).toBe(
			"+R$ 1,30 por dia (≈ R$ 39 a mais por mês)",
		);
		expect(costChangeLabel(-0.5)).toBe(
			"−R$ 0,50 por dia (≈ R$ 15 a menos por mês)",
		);
		expect(costChangeLabel(0.02)).toBe("Quase o mesmo custo");
		expect(costChangeShort(0.2)).toBe("+R$ 0,20/dia");
		expect(costChangeShort(-1)).toBe("−R$ 1,00/dia");
		expect(costChangeShort(0)).toBe("mesmo custo");
	});
});

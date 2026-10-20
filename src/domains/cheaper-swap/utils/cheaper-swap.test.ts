import { describe, expect, it } from "vitest";

import {
	cheaperSwap,
	cheaperSwapPrompt,
	cheaperSwaps,
	monthlySaving,
	pickCheaperSwap,
} from "~/domains/cheaper-swap/utils/cheaper-swap";
import type { Food } from "~/domains/food/types/food-types";
import type { Price } from "~/domains/shopping/data/reference-prices";
import { priceKey } from "~/domains/shopping/utils/prices";

const FRUITS = "Frutas e derivados";

// Valores por 100 g da TACO.
const taco = (
	name: string,
	[protein, carbs, fat]: [number, number, number],
): Food => ({
	id: name,
	source: "taco",
	name,
	category: FRUITS,
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource: "vegetal",
});

// Preços de referência: maçã R$ 12/kg, mamão R$ 7/kg, banana-prata R$ 7/kg,
// banana-nanica R$ 6/kg.
const maca = taco("Maçã, Fuji, com casca, crua", [0.3, 15.2, 0]);
const mamao = taco("Mamão, Formosa, cru", [0.8, 11.6, 0.1]);
const prata = taco("Banana, prata, crua", [1.3, 26, 0.1]);
const nanica = taco("Banana, nanica, crua", [1.4, 23.8, 0.1]);
const uva = taco("Uva, Itália, crua", [0.8, 13.6, 0.2]);

const item = { id: "item-1", food: maca, quantity: 155 };
const noPrices = new Map<string, Price>();

describe("cheaperSwap", () => {
	it("troca equivalente que sai mais barata, com a economia por dia", () => {
		const swap = cheaperSwap(item, prata, noPrices);
		expect(swap?.food).toBe(prata);
		expect(swap?.quantity).toBeGreaterThan(0);
		// 155 g de maçã (R$ 1,86) → ~90 g de banana (R$ 0,63).
		expect(swap?.saving).toBeGreaterThan(1);
		expect(swap?.before).toBeCloseTo(1.86);
	});

	it("nada quando sai mais caro ou economiza pouco", () => {
		const banana = { id: "item-2", food: prata, quantity: 90 };
		expect(cheaperSwap(banana, maca, noPrices)).toBeNull();
		// Banana-nanica: uns centavos a menos, abaixo do mínimo.
		expect(cheaperSwap(banana, nanica, noPrices)).toBeNull();
	});

	it("nada sem preço de um dos lados ou sem equivalência", () => {
		expect(cheaperSwap(item, uva, noPrices)).toBeNull();
		expect(
			cheaperSwap(item, taco("Abacate, cru", [1.2, 6, 8.4]), noPrices),
		).toBeNull();
	});

	it("o preço da pessoa vence a referência", () => {
		const prices = new Map<string, Price>([
			[priceKey("Banana-prata"), { value: 40, per: "kg" }],
		]);
		expect(cheaperSwap(item, prata, prices)).toBeNull();
	});
});

describe("cheaperSwaps", () => {
	it("só os alimentos comuns mais baratos, do que economiza mais pro menos", () => {
		const swaps = cheaperSwaps(item, [mamao, nanica, uva], noPrices);
		expect(swaps.map((swap) => swap.food.name)).toEqual([
			"Banana, nanica, crua",
			"Mamão, Formosa, cru",
		]);
		expect(swaps[0].saving).toBeGreaterThan(swaps[1].saving);
	});
});

describe("cheaperSwaps: o que faz sentido trocar", () => {
	const papaia = taco("Mamão, Papaia, cru", [0.5, 10.4, 0.1]);
	const mandioca = {
		...taco("Mandioca, cozida", [0.6, 30.1, 0.3]),
		category: "Cereais e derivados",
	};

	it("outra variedade do mesmo alimento vale (papaia → formosa)", () => {
		const item = { id: "item-4", food: papaia, quantity: 190 };
		expect(
			cheaperSwaps(item, [mamao, mandioca], noPrices).map(
				(swap) => swap.food.name,
			),
		).toEqual(["Mamão, Formosa, cru"]);
	});

	it("nada que no mercado é o mesmo produto (ovo cru → ovo cozido)", () => {
		const ovo = (name: string, macros: [number, number, number]): Food => ({
			...taco(name, macros),
			category: "Ovos e derivados",
			proteinSource: "animal",
		});
		const item = {
			id: "item-6",
			food: ovo("Ovo, de galinha, inteiro, cru", [13, 1.6, 8.9]),
			quantity: 200,
		};
		expect(
			cheaperSwap(
				item,
				ovo("Ovo, de galinha, inteiro, cozido/10minutos", [14, 0.6, 9.5]),
				noPrices,
			),
		).toBeNull();
	});

	it("verdura e o que quase não tem macro não ganham troca", () => {
		const alface = {
			...taco("Alface, crespa, crua", [1.3, 1.7, 0.2]),
			category: "Verduras, hortaliças e derivados",
		};
		const item = { id: "item-5", food: alface, quantity: 60 };
		expect(cheaperSwaps(item, [mandioca], noPrices)).toEqual([]);
	});
});

describe("monthlySaving", () => {
	it("arredonda pro real", () => {
		expect(monthlySaving(1.23)).toBe(37);
		expect(monthlySaving(0.1)).toBe(3);
	});
});

describe("cheaperSwapPrompt", () => {
	it("leva a refeição, os outros alimentos e as opções com código", () => {
		const options = cheaperSwaps(item, [mamao, nanica], noPrices);
		const prompt = cheaperSwapPrompt(
			{ name: "Lanche da tarde", time: "16:00" },
			item,
			[{ food: taco("Iogurte, natural", [4.1, 1.9, 3]), quantity: 170 }],
			options,
		);
		expect(prompt).toContain("Refeição: Lanche da tarde (16:00)");
		expect(prompt).toContain("Iogurte, natural");
		expect(prompt).toContain("Trocar: 155 g de Maçã, Fuji, com casca, crua");
		expect(prompt).toMatch(/S1 = \d+ g de Banana, nanica, crua/);
		expect(prompt).toMatch(/S2 = \d+ g de Mamão, Formosa, cru/);
		expect(prompt).toContain("por mês");
	});
});

describe("pickCheaperSwap", () => {
	const options = cheaperSwaps(item, [mamao, nanica], noPrices);

	it("a opção do código escolhido", () => {
		expect(pickCheaperSwap(options, "S2")?.food).toBe(mamao);
	});

	it("código inventado cai na que economiza mais", () => {
		expect(pickCheaperSwap(options, "S9")?.food).toBe(nanica);
		expect(pickCheaperSwap([], "S1")).toBeNull();
	});
});

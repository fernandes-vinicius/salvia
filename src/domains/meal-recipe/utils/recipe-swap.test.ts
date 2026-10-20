import { describe, expect, it } from "vitest";

import type { Food } from "~/domains/food/types/food-types";
import {
	applySwaps,
	isLightMeal,
	swapCandidates,
	swapCategories,
	swapQuantity,
	swapsFromCodes,
} from "~/domains/meal-recipe/utils/recipe-swap";

const FRUITS = "Frutas e derivados";
const MEATS = "Carnes e derivados";

// Valores por 100 g da TACO.
const taco = (
	name: string,
	category: string | null,
	[protein, carbs, fat]: [number, number, number],
	proteinSource: Food["proteinSource"] = "vegetal",
): Food => ({
	id: name,
	source: "taco",
	name,
	category,
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource,
});

const mamao = taco("Mamão, Formosa, cru", FRUITS, [0.8, 11.6, 0.1]);
const prata = taco("Banana, prata, crua", FRUITS, [1.3, 26, 0.1]);
const nanica = taco("Banana, nanica, crua", FRUITS, [1.4, 23.8, 0.1]);
const maca = taco("Maçã, Fuji, com casca, crua", FRUITS, [0.3, 15.2, 0]);
const papaia = taco("Mamão, Papaia, cru", FRUITS, [0.5, 10.4, 0.1]);
const bananada = taco("Banana, doce em barra", FRUITS, [2.2, 75.7, 0.1]);
const abacate = taco("Abacate, cru", FRUITS, [1.2, 6, 8.4]);
const jamelao = taco("Jamelão, cru", FRUITS, [0.5, 10.6, 0.1]);
const frango = taco(
	"Frango, peito, sem pele, grelhado",
	MEATS,
	[32, 0, 2.5],
	"animal",
);
const tofu = taco("Tofu", "Leguminosas e derivados", [8.5, 4.3, 4.6]);

const item = { id: "item-1", food: mamao, quantity: 200 };

describe("swapQuantity", () => {
	it("acha a quantidade que mantém o macro principal, se o resto quase não muda", () => {
		expect(swapQuantity(item, prata)).toBe(90);
		expect(swapQuantity(item, maca)).toBe(155);
	});

	it("recusa quando outro macro muda demais", () => {
		expect(swapQuantity(item, abacate)).toBeNull();
		expect(swapQuantity({ food: frango, quantity: 120 }, tofu)).toBeNull();
	});

	it("aceita porção bem maior quando faz sentido (leite em pó → leite)", () => {
		const po = taco(
			"Leite, de vaca, integral, pó",
			"Leite e derivados",
			[25.4, 39.2, 26.9],
			"animal",
		);
		const leite = taco(
			"Leite, de vaca, integral",
			"Leite e derivados",
			[3, 4.5, 3],
			"animal",
		);
		expect(swapQuantity({ food: po, quantity: 20 }, leite)).toBe(180);
	});

	it("recusa o próprio alimento e quantidades absurdas", () => {
		expect(swapQuantity(item, mamao)).toBeNull();
		const alface = taco("Alface, crespa, crua", FRUITS, [1.3, 1.7, 0.2]);
		expect(swapQuantity(item, alface)).toBeNull();
	});
});

describe("swapCategories", () => {
	it("agrupa categorias que trocam bem entre si", () => {
		expect(swapCategories(MEATS)).toContain("Pescados e frutos do mar");
		expect(swapCategories("Cereais e derivados")).toContain(
			"Verduras, hortaliças e derivados",
		);
		expect(swapCategories(FRUITS)).toEqual([FRUITS]);
	});

	it("sem categoria (alimento próprio) ou fora dos grupos: nenhuma", () => {
		expect(swapCategories(null)).toEqual([]);
		expect(swapCategories("Gorduras e óleos")).toEqual([]);
	});
});

describe("swapCandidates", () => {
	const foods = [
		mamao,
		papaia,
		prata,
		nanica,
		maca,
		bananada,
		abacate,
		jamelao,
		frango,
	];

	it("lista as trocas mais parecidas, uma por tipo de alimento", () => {
		expect(
			swapCandidates(item, foods).map(({ food, quantity }) => [
				food.name,
				quantity,
			]),
		).toEqual([
			["Banana, prata, crua", 90],
			["Maçã, Fuji, com casca, crua", 155],
		]);
	});

	it("só sugere alimentos comuns, e nunca cru no lugar de cozido", () => {
		const arroz = taco(
			"Arroz, tipo 1, cozido",
			"Cereais e derivados",
			[2.5, 28.1, 0.2],
		);
		const verduras = "Verduras, hortaliças e derivados";
		const batata = taco("Batata, doce, cozida", verduras, [0.6, 18.4, 0.1]);
		const mandiocaCrua = taco("Mandioca, crua", verduras, [1.1, 36.2, 0.3]);
		const polenta = taco(
			"Polenta, pré-cozida",
			"Cereais e derivados",
			[2.3, 16.9, 0.3],
		);
		const names = swapCandidates({ id: "a", food: arroz, quantity: 100 }, [
			batata,
			mandiocaCrua,
			polenta,
		]).map(({ food }) => food.name);
		expect(names).toEqual(["Batata, doce, cozida"]);
	});

	it("respeita o limite", () => {
		expect(swapCandidates(item, foods, { limit: 1 })).toHaveLength(1);
	});
});

describe("swapCandidates sem o grupo (variar refeição)", () => {
	const arroz = taco(
		"Arroz, tipo 1, cozido",
		"Cereais e derivados",
		[2.5, 28.1, 0.2],
	);
	const almoco = { id: "a", food: arroz, quantity: 150 };

	it("aceita outro grupo quando os macros batem", () => {
		const names = (sameGroup: boolean) =>
			swapCandidates(almoco, [prata], { sameGroup }).map(
				({ food }) => food.name,
			);
		expect(names(true)).toEqual([]);
		expect(names(false)).toEqual(["Banana, prata, crua"]);
	});

	it("aceita o mesmo tipo de alimento (banana prata → nanica)", () => {
		const names = (sameGroup: boolean) =>
			swapCandidates({ id: "b", food: prata, quantity: 100 }, [nanica], {
				sameGroup,
			}).map(({ food }) => food.name);
		expect(names(true)).toEqual([]);
		expect(names(false)).toEqual(["Banana, nanica, crua"]);
	});

	it("alimento próprio entra mesmo fora da lista de comuns", () => {
		const proprio: Food = {
			...taco("Peito desfiado da marmita", null, [30, 0, 3], "animal"),
			source: "custom",
		};
		const result = swapCandidates(
			{ id: "f", food: frango, quantity: 120 },
			[proprio],
			{ sameGroup: false },
		);
		expect(result.map(({ food }) => food.name)).toEqual([
			"Peito desfiado da marmita",
		]);
	});
});

describe("applySwaps", () => {
	it("troca o item e guarda o que ele substituiu", () => {
		const other = { id: "item-2", food: frango, quantity: 100 };
		expect(
			applySwaps(
				[item, other],
				[{ itemId: "item-1", food: prata, quantity: 90 }],
			),
		).toEqual([
			{ food: prata, quantity: 90, replaces: { food: mamao, quantity: 200 } },
			{ food: frango, quantity: 100 },
		]);
	});
});

describe("swapsFromCodes", () => {
	const options = [
		{
			...item,
			swaps: [
				{ code: "T1", food: prata, quantity: 90 },
				{ code: "T2", food: maca, quantity: 155 },
			],
		},
		{
			id: "item-2",
			food: frango,
			quantity: 100,
			swaps: [{ code: "T3", food: frango, quantity: 100 }],
		},
	];

	it("ignora código inventado e usa no máximo uma troca por item", () => {
		expect(swapsFromCodes(options, ["T9", "T2", "T1"])).toEqual([
			{ itemId: "item-1", food: maca, quantity: 155 },
		]);
	});

	it("respeita o máximo de trocas", () => {
		expect(swapsFromCodes(options, ["T1", "T3"], 1)).toHaveLength(1);
	});
});

describe("isLightMeal", () => {
	it("café, lanche e ceia pelo nome", () => {
		expect(isLightMeal({ name: "Café da manhã", time: null })).toBe(true);
		expect(isLightMeal({ name: "Lanche da tarde", time: "16:00" })).toBe(true);
		expect(isLightMeal({ name: "Ceia", time: null })).toBe(true);
		expect(isLightMeal({ name: "Almoço", time: "12:30" })).toBe(false);
	});

	it("nome livre: decide pelo horário", () => {
		expect(isLightMeal({ name: "Refeição 1", time: "07:30" })).toBe(true);
		expect(isLightMeal({ name: "Refeição 3", time: "19:30" })).toBe(false);
		expect(isLightMeal({ name: "Pós-treino", time: "22:30" })).toBe(true);
		expect(isLightMeal({ name: "Refeição 2", time: null })).toBe(false);
	});
});

describe("swapCandidates em refeição leve", () => {
	it("não oferece arroz, feijão nem lentilha", () => {
		const pao = taco(
			"Pão, trigo, francês",
			"Cereais e derivados",
			[8, 58.6, 3.1],
		);
		const arrozIntegral = taco(
			"Arroz, integral, cozido",
			"Cereais e derivados",
			[2.6, 25.8, 1],
		);
		const names = (light: boolean) =>
			swapCandidates({ id: "p", food: pao, quantity: 50 }, [arrozIntegral], {
				light,
			}).map(({ food }) => food.name);
		expect(names(false)).toEqual(["Arroz, integral, cozido"]);
		expect(names(true)).toEqual([]);
	});
});

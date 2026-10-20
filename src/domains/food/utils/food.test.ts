import { describe, expect, it } from "vitest";

import {
	kcalFor,
	macrosFor,
	normalizeSearchText,
	parseCsv,
	sumMacros,
	tacoMacros,
	tacoProteinSource,
} from "~/domains/food/utils/food";

describe("normalizeSearchText", () => {
	it("tira acentos, caixa e espaços extras", () => {
		expect(normalizeSearchText("  Pão   FRANCÊS ")).toBe("pao frances");
	});
});

describe("macrosFor", () => {
	const ovo = {
		unit: "g" as const,
		protein: 13,
		carbs: 1.6,
		fat: 8.9,
		proteinSource: "animal" as const,
	};

	it("escala por 100 g e separa proteína animal", () => {
		const macros = macrosFor(ovo, 200);
		expect(macros).toEqual({
			proteinAnimal: 26,
			proteinVegetal: 0,
			carbs: 3.2,
			fat: 17.8,
		});
	});

	it("multiplica por unidade quando o alimento é por unidade", () => {
		const pao = {
			unit: "unit" as const,
			protein: 2,
			carbs: 12,
			fat: 1.5,
			proteinSource: "vegetal" as const,
		};
		expect(macrosFor(pao, 2)).toEqual({
			proteinAnimal: 0,
			proteinVegetal: 4,
			carbs: 24,
			fat: 3,
		});
	});
});

describe("kcalFor / sumMacros", () => {
	it("soma e calcula kcal 4/4/9 como na planilha", () => {
		// Refeição 1 da planilha: P(A) 26, P(V) 1, C 26, G 18 → 374 kcal.
		const total = sumMacros([
			{ proteinAnimal: 26, proteinVegetal: 0, carbs: 3, fat: 18 },
			{ proteinAnimal: 0, proteinVegetal: 1, carbs: 23, fat: 0 },
		]);
		expect(total).toEqual({
			proteinAnimal: 26,
			proteinVegetal: 1,
			carbs: 26,
			fat: 18,
		});
		expect(kcalFor(total)).toBe(374);
	});
});

describe("tacoProteinSource", () => {
	it("usa a categoria quando ela é de origem animal", () => {
		expect(tacoProteinSource(6, "Carne, bovina, acém")).toBe("animal");
		expect(tacoProteinSource(1, "Arroz, integral, cozido")).toBe("vegetal");
	});

	it("trata exceções e pratos regionais com carne", () => {
		expect(tacoProteinSource(11, "Leite, de coco")).toBe("vegetal");
		expect(tacoProteinSource(13, "Quibebe")).toBe("vegetal");
		expect(tacoProteinSource(13, "Vaca atolada")).toBe("animal");
		expect(tacoProteinSource(13, "Macarrão, molho bolognesa")).toBe("animal");
	});

	it("decide pelo nome em categorias mistas", () => {
		expect(tacoProteinSource(13, "Frango, com açafrão")).toBe("animal");
		expect(tacoProteinSource(13, "Salada, de legumes, cozida no vapor")).toBe(
			"vegetal",
		);
	});
});

describe("parseCsv", () => {
	it("lida com aspas e vírgulas dentro do campo", () => {
		const rows = parseCsv('id,name\n1,"Arroz, integral, cozido"\n2,Mel\n');
		expect(rows).toEqual([
			{ id: "1", name: "Arroz, integral, cozido" },
			{ id: "2", name: "Mel" },
		]);
	});
});

describe("tacoMacros", () => {
	it("lê os macros da linha da TACO (vazio = 0)", () => {
		expect(
			tacoMacros("Aveia, flocos, crua", {
				protein: "13.9",
				carbohydrates: "66.6",
				lipids: "8.5",
				dietaryFiber: "",
			}),
		).toEqual({ protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 0 });
	});

	it("preenche o leite fluido, que a TACO não mediu", () => {
		const empty = { protein: "", carbohydrates: "", lipids: "" };
		expect(tacoMacros("Leite, de vaca, integral", empty)).toEqual({
			protein: 3.15,
			carbs: 4.8,
			fat: 3.25,
			fiber: 0,
		});
		expect(tacoMacros("Leite, de vaca, desnatado, UHT", empty).fat).toBe(0.08);
	});
});

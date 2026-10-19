import { describe, expect, it } from "vitest";

import {
	bestMatch,
	checkUploads,
	importedQuantity,
	mealTime,
	searchQueriesFor,
} from "~/domains/diet-import/utils/diet-import";

describe("searchQueriesFor", () => {
	it("vai do nome completo até a primeira palavra", () => {
		expect(searchQueriesFor("Frango peito grelhado")).toEqual([
			"frango peito grelhado",
			"frango peito",
			"frango",
		]);
	});

	it("ignora palavras de ligação e repetições", () => {
		expect(searchQueriesFor("ovo de galinha cozido")).toEqual([
			"ovo galinha cozido",
			"ovo galinha",
			"ovo",
		]);
		expect(searchQueriesFor("Banana")).toEqual(["banana"]);
	});

	it("nome vazio não gera busca", () => {
		expect(searchQueriesFor("  ")).toEqual([]);
	});
});

describe("importedQuantity", () => {
	it("alimento por unidade usa a contagem lida, em meias unidades", () => {
		expect(importedQuantity("unit", { grams: 100, units: 2 })).toBe(2);
		expect(importedQuantity("unit", { grams: null, units: 1.3 })).toBe(1.5);
	});

	it("alimento por unidade sem contagem fica com 1", () => {
		expect(importedQuantity("unit", { grams: 50, units: null })).toBe(1);
	});

	it("alimento em gramas usa o peso lido, no passo de 5 g", () => {
		expect(importedQuantity("g", { grams: 123, units: null })).toBe(125);
		expect(importedQuantity("ml", { grams: 200, units: 1 })).toBe(200);
	});

	it("respeita os limites do editor", () => {
		expect(importedQuantity("g", { grams: 2, units: null })).toBe(5);
		expect(importedQuantity("g", { grams: 5000, units: null })).toBe(1000);
		expect(importedQuantity("unit", { grams: null, units: 40 })).toBe(20);
	});

	it("sem peso lido usa o padrão de 100 g", () => {
		expect(importedQuantity("g", { grams: null, units: 2 })).toBe(100);
	});
});

describe("checkUploads", () => {
	const file = (type: string, size: number) => ({ type, size });

	it("aceita fotos e PDF dentro do limite", () => {
		expect(
			checkUploads([file("image/jpeg", 500_000), file("application/pdf", 1e6)]),
		).toBeNull();
	});

	it("pede ao menos um arquivo", () => {
		expect(checkUploads([])).toMatch(/envie/i);
	});

	it("recusa tipo não suportado", () => {
		expect(checkUploads([file("text/plain", 10)])).toMatch(/foto ou PDF/);
	});

	it("recusa arquivos demais ou grandes demais", () => {
		expect(checkUploads(Array(5).fill(file("image/png", 10)))).toMatch(/até 4/);
		expect(checkUploads([file("application/pdf", 4_000_000)])).toMatch(
			/3,5 MB/,
		);
	});
});

describe("mealTime", () => {
	it("aceita HH:MM e formatos comuns do papel", () => {
		expect(mealTime("07:30")).toBe("07:30");
		expect(mealTime("7:30")).toBe("07:30");
		expect(mealTime("7h30")).toBe("07:30");
		expect(mealTime("12h")).toBe("12:00");
		expect(mealTime(" 21 h ")).toBe("21:00");
	});

	it("horário inválido ou ausente vira nulo", () => {
		expect(mealTime(null)).toBeNull();
		expect(mealTime("")).toBeNull();
		expect(mealTime("25:00")).toBeNull();
		expect(mealTime("manhã")).toBeNull();
	});
});

describe("bestMatch", () => {
	const named = (...names: string[]) => names.map((name) => ({ name }));

	it("fica com o nome que tem mais palavras em comum", () => {
		const candidates = named("Arroz carreteiro", "Arroz, tipo 1, cozido");
		expect(bestMatch("arroz branco cozido", candidates)?.name).toBe(
			"Arroz, tipo 1, cozido",
		);
	});

	it("ignora plural e acento ao comparar", () => {
		const candidates = named(
			"Ovo, de galinha, inteiro, cru",
			"Ovo, de galinha, inteiro, frito",
		);
		expect(bestMatch("ovos fritos", candidates)?.name).toBe(
			"Ovo, de galinha, inteiro, frito",
		);
		expect(bestMatch("tilapia", named("Tilápia, filé, cru"))?.name).toBe(
			"Tilápia, filé, cru",
		);
	});

	it("empate fica com o primeiro da lista (ordem da busca)", () => {
		const candidates = named("Banana, prata, crua", "Banana, nanica, crua");
		expect(bestMatch("banana", candidates)?.name).toBe("Banana, prata, crua");
	});

	it("sem palavra em comum não casa", () => {
		expect(
			bestMatch("tilapia grelhada", named("Arroz, tipo 1, cozido")),
		).toBeNull();
		expect(bestMatch("arroz", [])).toBeNull();
	});
});

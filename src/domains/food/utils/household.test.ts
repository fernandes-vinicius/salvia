import { describe, expect, it } from "vitest";

import {
	householdHint,
	householdMeasures,
} from "~/domains/food/utils/household";

const arroz = { name: "Arroz, tipo 1, cozido", unit: "g" as const };

describe("householdMeasures", () => {
	it("acha pela TACO e pelas palavras-chave dos alimentos próprios", () => {
		expect(householdMeasures(arroz)[0]?.short).toBe("col. sopa");
		expect(
			householdMeasures({ name: "Whey Protein Baunilha", unit: "g" })[0]?.grams,
		).toBe(30);
		expect(
			householdMeasures({ name: "Azeite da casa", unit: "ml" })[0]?.grams,
		).toBe(8);
	});

	it("nada pra quem já é por unidade ou não tem medida", () => {
		expect(householdMeasures({ name: "Whey", unit: "unit" })).toEqual([]);
		expect(householdMeasures({ name: "Salada crua", unit: "g" })).toEqual([]);
	});
});

describe("householdHint", () => {
	it("descreve em meias medidas, curto e por extenso", () => {
		expect(householdHint(arroz, 100)).toMatchObject({
			count: 4,
			short: "≈ 4 col. sopa",
			long: "≈ 4 colheres de sopa",
		});
		expect(householdHint(arroz, 35)?.short).toBe("≈ 1,5 col. sopa");
	});

	it("escolhe a medida mais redonda (escumadeira em vez de 7 colheres)", () => {
		expect(householdHint(arroz, 180)?.short).toBe("≈ 2 escumadeiras");
	});

	it("singular/plural e limites", () => {
		const pao = { name: "Pão, trigo, forma, integral", unit: "g" as const };
		expect(householdHint(pao, 25)?.short).toBe("≈ 1 fatia");
		expect(householdHint(pao, 50)?.short).toBe("≈ 2 fatias");
		expect(householdHint({ name: "Óleo, de soja", unit: "g" }, 1)).toBeNull();
		expect(householdHint(arroz, 2000)).toBeNull();
	});
});

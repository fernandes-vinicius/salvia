import { describe, expect, it } from "vitest";

import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	calculateBmr,
	calculateTdee,
	findActivityLevel,
} from "~/domains/profile/utils/energy";

// Valores da planilha original (aba TMB).
const spreadsheetProfile: BodyProfile = {
	sex: "male",
	ageYears: 30,
	weightKg: 70,
	heightCm: 170,
	activityFactor: 1.3,
};

describe("calculateBmr", () => {
	it("reproduz a fórmula masculina da planilha", () => {
		expect(calculateBmr(spreadsheetProfile)).toBeCloseTo(1674.97, 2);
	});

	it("usa os coeficientes femininos", () => {
		expect(calculateBmr({ ...spreadsheetProfile, sex: "female" })).toBeCloseTo(
			655.1 + 9.563 * 70 + 1.85 * 170 - 4.676 * 30,
			5,
		);
	});
});

describe("calculateTdee", () => {
	it("bate com o GCD da planilha (2177,46 kcal)", () => {
		expect(calculateTdee(spreadsheetProfile)).toBeCloseTo(2177.461, 3);
	});
});

describe("findActivityLevel", () => {
	it("encontra o nível pelo fator", () => {
		expect(findActivityLevel(1.55)?.label).toBe("Moderado");
		expect(findActivityLevel(1.2)?.label).toBe("Sedentário");
	});

	it("retorna undefined pra fator fora da lista", () => {
		expect(findActivityLevel(1.3)).toBeUndefined();
		expect(findActivityLevel(1)).toBeUndefined();
	});
});

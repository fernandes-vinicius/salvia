import { describe, expect, it } from "vitest";

import {
	bmi,
	bmiCategory,
	bodyFatCategory,
	bodyFatNavy,
	healthyWeightRange,
} from "~/domains/calculators/utils/body-composition";

describe("bmi", () => {
	it("peso ÷ altura² (m)", () => {
		expect(bmi(80, 180)).toBeCloseTo(24.69, 2);
	});
});

describe("bmiCategory", () => {
	it("usa as faixas da OMS", () => {
		expect(bmiCategory(17).label).toBe("Abaixo do peso");
		expect(bmiCategory(22).label).toBe("Peso adequado");
		expect(bmiCategory(27).label).toBe("Sobrepeso");
		expect(bmiCategory(32).label).toBe("Obesidade grau I");
		expect(bmiCategory(37).label).toBe("Obesidade grau II");
		expect(bmiCategory(41).label).toBe("Obesidade grau III");
	});

	it("limites caem na faixa de cima", () => {
		expect(bmiCategory(18.5).label).toBe("Peso adequado");
		expect(bmiCategory(25).label).toBe("Sobrepeso");
	});
});

describe("healthyWeightRange", () => {
	it("peso do IMC 18,5 a 24,9 pra altura", () => {
		const range = healthyWeightRange(180);
		expect(range.min).toBeCloseTo(59.9, 1);
		expect(range.max).toBeCloseTo(80.7, 1);
	});
});

describe("bodyFatNavy", () => {
	it("homem: cintura e pescoço", () => {
		const fat = bodyFatNavy({
			sex: "male",
			heightCm: 178,
			neckCm: 38,
			waistCm: 85,
		});
		expect(fat).toBeCloseTo(16.6, 0);
	});

	it("mulher: cintura, quadril e pescoço", () => {
		const fat = bodyFatNavy({
			sex: "female",
			heightCm: 165,
			neckCm: 33,
			waistCm: 72,
			hipsCm: 98,
		});
		expect(fat).toBeCloseTo(26.8, 0);
	});

	it("medidas impossíveis (cintura menor que o pescoço) dão null", () => {
		expect(
			bodyFatNavy({ sex: "male", heightCm: 178, neckCm: 40, waistCm: 38 }),
		).toBeNull();
		expect(
			bodyFatNavy({ sex: "female", heightCm: 165, neckCm: 33, waistCm: 72 }),
		).toBeNull();
	});
});

describe("bodyFatCategory", () => {
	it("faixas diferentes pra homem e mulher", () => {
		expect(bodyFatCategory(10, "male").label).toBe("Atleta");
		expect(bodyFatCategory(16, "male").label).toBe("Em forma");
		expect(bodyFatCategory(20, "male").label).toBe("Média");
		expect(bodyFatCategory(28, "male").label).toBe("Acima da média");
		expect(bodyFatCategory(20, "female").label).toBe("Atleta");
		expect(bodyFatCategory(28, "female").label).toBe("Média");
	});
});

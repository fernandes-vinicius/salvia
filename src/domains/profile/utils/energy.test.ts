import { describe, expect, it } from "vitest";

import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	calculateBmr,
	calculateEnergy,
	calculateTrainingKcalPerDay,
	EXAMPLE_PROFILE,
	findOption,
	NEAT_LEVELS,
} from "~/domains/profile/utils/energy";

// 70 kg, 170 cm, 30 anos (valores da planilha original).
const base: BodyProfile = EXAMPLE_PROFILE;

describe("calculateBmr (Mifflin-St Jeor)", () => {
	it("masculino: 10·peso + 6,25·altura − 5·idade + 5", () => {
		expect(calculateBmr(base)).toBe(1617.5);
	});

	it("feminino: mesma base − 161", () => {
		expect(calculateBmr({ ...base, sex: "female" })).toBe(1451.5);
	});
});

describe("calculateBmr (Harris-Benedict)", () => {
	it("reproduz a fórmula masculina da planilha", () => {
		expect(calculateBmr(base, "harris")).toBeCloseTo(1674.97, 2);
	});

	it("usa os coeficientes femininos", () => {
		expect(calculateBmr({ ...base, sex: "female" }, "harris")).toBeCloseTo(
			655.1 + 9.563 * 70 + 1.85 * 170 - 4.676 * 30,
			5,
		);
	});

	it("propaga a fórmula escolhida para o gasto total", () => {
		const mifflin = calculateEnergy(base);
		const harris = calculateEnergy(base, "harris");
		expect(harris.bmr).toBeCloseTo(1674.97, 2);
		expect(harris.tdee).toBeGreaterThan(mifflin.tdee);
	});
});

describe("calculateTrainingKcalPerDay", () => {
	it("usa MET líquido e média semanal", () => {
		const kcal = calculateTrainingKcalPerDay(
			{ enabled: true, daysPerWeek: 4, minutesPerSession: 60, met: 5.5 },
			70,
		);
		expect(kcal).toBeCloseTo((4.5 * 70 * 1 * 4) / 7, 5);
	});

	it("é zero quando o treino está desligado", () => {
		expect(calculateTrainingKcalPerDay(base.strength, 70)).toBe(0);
	});
});

describe("calculateEnergy", () => {
	it("soma TMB × NEAT, treinos e 10% de digestão", () => {
		// Caso real: musculação 4×/sem, 60 min, moderada.
		const energy = calculateEnergy({
			...base,
			strength: { ...base.strength, enabled: true, daysPerWeek: 4 },
		});

		expect(energy.bmr).toBe(1617.5);
		expect(energy.daily).toBeCloseTo(1617.5 * 0.15, 5);
		expect(energy.strength).toBeCloseTo(180, 0);
		expect(energy.cardio).toBe(0);
		expect(energy.tdee).toBeCloseTo((1617.5 * 1.15 + 180) * 1.1, 0);
		expect(energy.digestion).toBeCloseTo(energy.tdee - energy.tdee / 1.1, 5);
	});
});

describe("findOption", () => {
	it("encontra o nível pelo valor", () => {
		expect(findOption(NEAT_LEVELS, 1.2)?.label).toBe("Moderadamente ativo");
		expect(findOption(NEAT_LEVELS, 1.55)).toBeUndefined();
	});
});

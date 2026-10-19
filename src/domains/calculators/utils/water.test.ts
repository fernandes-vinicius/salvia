import { describe, expect, it } from "vitest";

import { suggestedWater, waterPerDay } from "~/domains/calculators/utils/water";

describe("waterPerDay", () => {
	it("mínimo de 35 ml/kg e recomendado com o treino", () => {
		expect(
			waterPerDay({ weightKg: 70, trainingMinutes: 60, climate: "mild" }),
		).toEqual({ minimumMl: 2500, recommendedMl: 3300, trainingMl: 500 });
	});

	it("soma mais no calor e pra quem sua muito", () => {
		const hot = waterPerDay({
			weightKg: 80,
			trainingMinutes: 90,
			climate: "hot",
		});
		expect(hot.recommendedMl).toBe(4800); // 3200 + 1125 + 500
		const sweaty = waterPerDay({
			weightKg: 80,
			trainingMinutes: 90,
			climate: "sweaty",
		});
		expect(sweaty.recommendedMl).toBe(5200); // 3200 + 1500 + 500
	});

	it("sem treino, o recomendado fica só na base maior", () => {
		const rest = waterPerDay({
			weightKg: 60,
			trainingMinutes: 0,
			climate: "mild",
		});
		expect(rest).toEqual({
			minimumMl: 2100,
			recommendedMl: 2400,
			trainingMl: 0,
		});
	});
});

describe("suggestedWater", () => {
	const routine = (daysPerWeek: number, minutesPerSession: number) => ({
		enabled: true,
		daysPerWeek,
		minutesPerSession,
		met: 5,
	});

	it("usa o peso e a média diária de treino da semana", () => {
		// Musculação 5×60 + cardio 2×35 = 370 min/semana ≈ 52,9 min/dia.
		// 75 kg × 40 + 52,9/60 × 500 ≈ 3.441 → 3.400 ml; mínimo 75 × 35 = 2.625 → 2.600.
		expect(
			suggestedWater({
				weightKg: 75,
				strength: routine(5, 60),
				cardio: routine(2, 35),
			}),
		).toEqual({ minimumMl: 2600, recommendedMl: 3400, trainingMl: 400 });
	});

	it("ignora rotinas desligadas", () => {
		expect(
			suggestedWater({
				weightKg: 60,
				strength: { ...routine(4, 60), enabled: false },
				cardio: { ...routine(3, 30), enabled: false },
			}),
		).toEqual({ minimumMl: 2100, recommendedMl: 2400, trainingMl: 0 });
	});
});

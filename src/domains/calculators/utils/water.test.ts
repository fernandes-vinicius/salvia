import { describe, expect, it } from "vitest";

import { waterPerDay } from "~/domains/calculators/utils/water";

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

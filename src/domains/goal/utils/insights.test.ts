import { describe, expect, it } from "vitest";

import {
	carbsInsight,
	fatInsight,
	paceInsight,
	proteinInsight,
	weeklyTrainingHours,
} from "~/domains/goal/utils/insights";

describe("paceInsight", () => {
	it("perder: 0,5–1% do peso por semana, com a faixa em kg", () => {
		const insight = paceInsight({
			objective: "lose",
			calorieAdjustment: -500,
			weightKg: 80,
		});
		expect(insight?.text).toContain("0,4 a 0,8 kg");
		expect(insight?.attention).toBe(false);
	});

	it("chama atenção quando o ritmo passa de 1% por semana", () => {
		expect(
			paceInsight({ objective: "lose", calorieAdjustment: -1000, weightKg: 55 })
				?.attention,
		).toBe(true);
	});

	it("manter não tem dica de ritmo", () => {
		expect(
			paceInsight({
				objective: "maintain",
				calorieAdjustment: 0,
				weightKg: 70,
			}),
		).toBeNull();
	});
});

describe("proteinInsight", () => {
	it("faixa 1,6–2,2 g/kg em gramas", () => {
		const insight = proteinInsight({
			objective: "lose",
			proteinPerKg: 2.2,
			weightKg: 70,
			counting: "total",
		});
		expect(insight.text).toContain("112 a 154 g");
		expect(insight.attention).toBe(false);
	});

	it("abaixo de 1,6 g/kg (total) chama atenção", () => {
		expect(
			proteinInsight({
				objective: "gain",
				proteinPerKg: 1.2,
				weightKg: 70,
				counting: "total",
			}).attention,
		).toBe(true);
	});

	it("contando só a animal, explica que a total fica maior", () => {
		const insight = proteinInsight({
			objective: "maintain",
			proteinPerKg: 1.4,
			weightKg: 70,
			counting: "animal",
		});
		expect(insight.text).toContain("vegetal");
		expect(insight.attention).toBe(false);
	});
});

describe("fatInsight", () => {
	it("0,6–1,0 g/kg e a fatia das calorias", () => {
		const insight = fatInsight({ fatPerKg: 0.8, weightKg: 70, calories: 2000 });
		expect(insight.text).toContain("42 a 70 g");
		expect(insight.text).toContain("25%");
		expect(insight.attention).toBe(false);
	});

	it("abaixo de 20% das calorias chama atenção", () => {
		expect(
			fatInsight({ fatPerKg: 0.6, weightKg: 60, calories: 3000 }).attention,
		).toBe(true);
	});
});

describe("weeklyTrainingHours", () => {
	it("soma musculação e cardio ligados", () => {
		const routine = (enabled: boolean, days: number, minutes: number) => ({
			enabled,
			daysPerWeek: days,
			minutesPerSession: minutes,
			met: 5,
		});
		expect(
			weeklyTrainingHours({
				strength: routine(true, 4, 60),
				cardio: routine(true, 2, 30),
			}),
		).toBe(5);
		expect(
			weeklyTrainingHours({
				strength: routine(false, 4, 60),
				cardio: routine(true, 2, 30),
			}),
		).toBe(1);
	});
});

describe("carbsInsight", () => {
	it("volume moderado: 3–5 g/kg", () => {
		const insight = carbsInsight({
			objective: "maintain",
			carbsPerKg: 4,
			weightKg: 70,
			trainingHours: 4,
		});
		expect(insight.text).toContain("3 a 5 g/kg");
		expect(insight.attention).toBe(false);
	});

	it("volume alto: 5–7 g/kg, e carbo baixo chama atenção fora do perder peso", () => {
		const insight = carbsInsight({
			objective: "gain",
			carbsPerKg: 3,
			weightKg: 70,
			trainingHours: 9,
		});
		expect(insight.text).toContain("5 a 7 g/kg");
		expect(insight.attention).toBe(true);
	});

	it("perdendo peso, carbo abaixo da faixa é comum: sem alerta", () => {
		expect(
			carbsInsight({
				objective: "lose",
				carbsPerKg: 2,
				weightKg: 70,
				trainingHours: 4,
			}).attention,
		).toBe(false);
	});
});

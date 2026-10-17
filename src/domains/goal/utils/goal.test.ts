import { describe, expect, it } from "vitest";

import type { Goal } from "~/domains/goal/types/goal-types";
import {
	calculateTargets,
	defaultGoalFor,
	findPace,
	weeklyChangeKg,
} from "~/domains/goal/utils/goal";

const body = { tdee: 2596, bmr: 1675, weightKg: 70 };

describe("calculateTargets", () => {
	it("calcula meta e macros com carboidrato como resto", () => {
		const goal: Goal = {
			objective: "lose",
			calorieAdjustment: -500,
			proteinPerKg: 2.2,
			fatPerKg: 0.9,
			carbsPerKg: null,
		};
		const targets = calculateTargets(goal, body);

		expect(targets.calories).toBe(2096);
		expect(targets.protein.grams).toBeCloseTo(154);
		expect(targets.protein.kcal).toBeCloseTo(616);
		expect(targets.fat.grams).toBeCloseTo(63);
		expect(targets.fat.kcal).toBeCloseTo(567);
		expect(targets.carbs.grams).toBeCloseTo((2096 - 616 - 567) / 4);
		expect(targets.carbs.perKg).toBeCloseTo(228.25 / 70);
		expect(targets.warnings).toEqual([]);
	});

	it("avisa quando a meta fica abaixo da TMB", () => {
		const targets = calculateTargets(
			{ ...defaultGoalFor("lose"), calorieAdjustment: -1000 },
			body,
		);
		expect(targets.warnings).toContain("below-bmr");
	});

	it("zera carboidrato e avisa quando proteína + gordura passam da meta", () => {
		const targets = calculateTargets(
			{
				objective: "lose",
				calorieAdjustment: -1000,
				proteinPerKg: 3,
				fatPerKg: 1.5,
				carbsPerKg: null,
			},
			{ ...body, tdee: 1800 },
		);
		expect(targets.carbs.grams).toBe(0);
		expect(targets.warnings).toContain("carbs-negative");
	});

	it("avisa quando sobra pouco carboidrato", () => {
		const targets = calculateTargets(
			{
				objective: "lose",
				calorieAdjustment: -750,
				proteinPerKg: 2.5,
				fatPerKg: 1.5,
				carbsPerKg: null,
			},
			body,
		);
		expect(targets.warnings).toContain("carbs-low");
	});
});

describe("carboidrato manual", () => {
	it("usa o g/kg fixado e mostra a diferença pra meta", () => {
		const targets = calculateTargets(
			{
				objective: "lose",
				calorieAdjustment: -500,
				proteinPerKg: 2.2,
				fatPerKg: 0.9,
				carbsPerKg: 2,
			},
			body,
		);

		expect(targets.carbs.grams).toBeCloseTo(140);
		expect(targets.carbs.kcal).toBeCloseTo(560);
		expect(targets.macroCalories).toBeCloseTo(616 + 567 + 560);
		expect(targets.calorieGap).toBeCloseTo(1743 - 2096);
		// Avisos de carboidrato só valem no automático.
		expect(targets.warnings).toEqual([]);
	});

	it("no automático a soma fecha com a meta", () => {
		const targets = calculateTargets(defaultGoalFor("lose"), body);
		expect(targets.calorieGap).toBeCloseTo(0);
	});
});

describe("ritmo", () => {
	it("−500 kcal/dia ≈ 0,45 kg por semana", () => {
		expect(weeklyChangeKg(-500)).toBeCloseTo(-0.4545, 3);
	});

	it("reconhece ritmo pré-definido e personalizado", () => {
		expect(findPace("lose", -500)?.label).toBe("Recomendado");
		expect(findPace("lose", -471)).toBeUndefined();
	});

	it("manter não tem ajuste", () => {
		expect(defaultGoalFor("maintain").calorieAdjustment).toBe(0);
	});
});

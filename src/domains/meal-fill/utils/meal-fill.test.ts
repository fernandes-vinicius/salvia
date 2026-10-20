import { describe, expect, it } from "vitest";

import { summarizeDiet } from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food/types/food-types";
import {
	fillQuantities,
	hasMeaningfulGap,
	macroGap,
	mainMacro,
} from "~/domains/meal-fill/utils/meal-fill";
import {
	fillCandidates,
	fillPrompt,
} from "~/domains/meal-fill/utils/meal-fill-prompt";

const food = (over: Partial<Food>): Food => ({
	id: over.name ?? "f",
	source: "taco",
	name: "Alimento",
	category: null,
	unit: "g",
	protein: 0,
	carbs: 0,
	fat: 0,
	fiber: 0,
	proteinSource: "vegetal",
	...over,
});

const chicken = food({
	name: "Frango",
	protein: 32,
	fat: 2.5,
	proteinSource: "animal",
});
const rice = food({ name: "Arroz", protein: 2.5, carbs: 28, fat: 0.2 });
const olive = food({ name: "Azeite", fat: 100 });

const targets = {
	calories: 2000,
	protein: { grams: 150 },
	carbs: { grams: 200 },
	fat: { grams: 60 },
};

describe("macroGap", () => {
	it("o que falta pra meta (nunca negativo)", () => {
		const summary = summarizeDiet(
			[
				{
					id: "m",
					name: "Almoço",
					time: null,
					items: [{ id: "i", food: chicken, quantity: 200, options: [] }],
				},
			],
			{ weightKg: 70, tdee: 2500 },
		);
		const gap = macroGap(summary, targets, "total");
		expect(gap.protein).toBeCloseTo(86);
		expect(gap.carbs).toBe(200);
		expect(gap.fat).toBeCloseTo(55);
	});
});

describe("hasMeaningfulGap", () => {
	it("ignora sobras pequenas", () => {
		expect(hasMeaningfulGap({ protein: 3, carbs: 8, fat: 2, kcal: 60 })).toBe(
			false,
		);
		expect(hasMeaningfulGap({ protein: 20, carbs: 0, fat: 0, kcal: 80 })).toBe(
			true,
		);
	});
});

describe("mainMacro", () => {
	it("o macro que mais pesa nas kcal", () => {
		expect(mainMacro(chicken)).toBe("protein");
		expect(mainMacro(rice)).toBe("carbs");
		expect(mainMacro(olive)).toBe("fat");
	});
});

describe("fillQuantities", () => {
	it("proteína primeiro, depois carbo e gordura, descontando o que já veio", () => {
		const items = fillQuantities(
			[rice, chicken, olive],
			{ protein: 40, carbs: 60, fat: 15, kcal: 535 },
			"total",
		);
		expect(items.map((item) => item.food.name)).toEqual([
			"Frango",
			"Arroz",
			"Azeite",
		]);
		// 40 g de proteína ÷ 32 = 125 g de frango.
		expect(items[0].quantity).toBe(125);
		// Carbo: 60 g ÷ 28 ≈ 215 g de arroz (passo de 5).
		expect(items[1].quantity).toBe(215);
		// Gordura: 15 − 3,1 (frango) − 0,4 (arroz) ≈ 11,5 g → 10 g de azeite.
		expect(items[2].quantity).toBe(10);
	});

	it("pula o alimento quando o macro dele já está coberto", () => {
		const items = fillQuantities(
			[chicken, olive],
			{ protein: 30, carbs: 0, fat: 2, kcal: 140 },
			"total",
		);
		expect(items.map((item) => item.food.name)).toEqual(["Frango"]);
	});

	it("contando só a animal, proteína vegetal não cobre a meta", () => {
		const beans = food({ name: "Feijão", protein: 5, carbs: 14, fat: 0.5 });
		expect(
			fillQuantities(
				[{ ...beans, protein: 20, carbs: 1 }],
				{ protein: 30, carbs: 0, fat: 0, kcal: 120 },
				"animal",
			),
		).toEqual([]);
	});
});

describe("fillCandidates e fillPrompt", () => {
	const gap = { protein: 30, carbs: 50, fat: 2, kcal: 340 };

	it("só os alimentos dos macros que faltam, com código", () => {
		const candidates = fillCandidates([chicken, rice, olive], gap);
		expect(candidates.map((c) => `${c.code} ${c.food.name}`)).toEqual([
			"F1 Frango",
			"F2 Arroz",
		]);
	});

	it("tira os nomes excluídos (comida de prato no lanche)", () => {
		expect(
			fillCandidates([chicken, rice], gap, { excludeNames: ["arroz"] }).map(
				(c) => c.food.name,
			),
		).toEqual(["Frango"]);
	});

	it("o prompt diz a refeição, o que falta e a lista", () => {
		const prompt = fillPrompt({
			meal: { name: "Almoço", time: "12:30", items: [] },
			gap,
			candidates: fillCandidates([chicken, rice], gap),
			avoid: ["Frango + Arroz"],
		});
		expect(prompt).toContain("Refeição: Almoço (12:30)");
		expect(prompt).toContain("30 g de proteína, 50 g de carboidrato.");
		expect(prompt).toContain("F1 = Frango · proteína");
		expect(prompt).toContain("- Frango + Arroz");
	});
});

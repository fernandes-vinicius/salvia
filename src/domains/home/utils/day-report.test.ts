import { describe, expect, it } from "vitest";

import type { Checkin } from "~/domains/checkin/types/checkin-types";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import { buildDayReport, dayReportText } from "~/domains/home/utils/day-report";
import type { Supplement } from "~/domains/supplements/types/supplement-types";

const DAY = "2026-11-17";

function food(overrides: Partial<Food>): Food {
	return {
		id: "f",
		name: "Alimento",
		source: "taco",
		category: null,
		unit: "g",
		protein: 0,
		carbs: 0,
		fat: 0,
		fiber: 0,
		proteinSource: "animal",
		...overrides,
	};
}

const egg = food({ id: "egg", name: "Ovo", protein: 13, fat: 9 });
const rice = food({
	id: "rice",
	name: "Arroz",
	protein: 2.5,
	carbs: 28,
	proteinSource: "vegetal",
});

const meals: DietMeal[] = [
	{
		id: "m1",
		name: "Café",
		time: "07:30",
		items: [{ id: "i1", quantity: 100, food: egg, options: [] }],
	},
	{
		id: "m2",
		name: "Almoço",
		time: "12:30",
		items: [{ id: "i2", quantity: 200, food: rice, options: [] }],
	},
	// Sem alimentos: fica fora do relatório (não entra no check-in).
	{ id: "m3", name: "Ceia", time: null, items: [] },
];

const supplement = (id: string, name: string): Supplement => ({
	id,
	name,
	dose: 5,
	unit: "g",
	timing: "wake_up",
	mealId: null,
	time: null,
	days: "every_day",
	weekdays: [],
	note: null,
});

describe("buildDayReport", () => {
	const checkins: Checkin[] = [
		{ mealId: "m1", day: DAY, status: "done" },
		{ mealId: "m2", day: DAY, status: "skipped" },
		// Outro dia: não conta.
		{ mealId: "m2", day: "2026-11-18", status: "done" },
	];

	const report = buildDayReport({
		day: DAY,
		meals,
		checkins,
		water: { day: DAY, ml: 1500, targetMl: 2800, entries: [500, 1000] },
		waterTargetMl: 3000,
		supplements: [supplement("s1", "Creatina"), supplement("s2", "Vitamina D")],
		taken: ["s1"],
		weightKg: 82.4,
		proteinCounting: "total",
	});

	it("traz só as refeições com alimentos, com o que foi marcado no dia", () => {
		expect(report.meals.map((meal) => [meal.name, meal.status])).toEqual([
			["Café", "done"],
			["Almoço", "skipped"],
		]);
		expect(report.followed).toBe(1);
		expect(report.mealCount).toBe(2);
		expect(report.complete).toBe(false);
	});

	it("soma os macros planejados de cada refeição e do dia", () => {
		expect(report.meals[0]).toMatchObject({ protein: 13, carbs: 0, fat: 9 });
		expect(report.meals[1]).toMatchObject({ protein: 5, carbs: 56, fat: 0 });
		expect(report.totals).toEqual({
			protein: 18,
			carbs: 56,
			fat: 9,
			kcal: 13 * 4 + 9 * 9 + 5 * 4 + 56 * 4,
		});
	});

	it("conta só a proteína animal quando a preferência pede", () => {
		const animal = buildDayReport({
			day: DAY,
			meals,
			checkins,
			water: undefined,
			waterTargetMl: null,
			supplements: [],
			taken: [],
			weightKg: null,
			proteinCounting: "animal",
		});
		expect(animal.totals.protein).toBe(13);
	});

	it("água do dia contra o recomendado que valia naquele dia", () => {
		expect(report.water).toEqual({
			ml: 1500,
			targetMl: 2800,
			percent: 54,
			entries: [500, 1000],
		});
	});

	it("sem registro de água usa o recomendado de agora", () => {
		const empty = buildDayReport({
			day: DAY,
			meals,
			checkins: [],
			water: undefined,
			waterTargetMl: 3000,
			supplements: [],
			taken: [],
			weightKg: null,
			proteinCounting: "total",
		});
		expect(empty.water).toEqual({
			ml: 0,
			targetMl: 3000,
			percent: 0,
			entries: [],
		});
		expect(empty.followed).toBe(0);
		expect(empty.meals.every((meal) => meal.status === null)).toBe(true);
	});

	it("suplementos com o que foi tomado e a pesagem", () => {
		expect(report.supplements.map((s) => [s.name, s.taken])).toEqual([
			["Creatina", true],
			["Vitamina D", false],
		]);
		expect(report.takenCount).toBe(1);
		expect(report.weightKg).toBe(82.4);
	});

	it("dia completo quando seguiu todas", () => {
		const full = buildDayReport({
			day: DAY,
			meals,
			checkins: [
				{ mealId: "m1", day: DAY, status: "done" },
				{ mealId: "m2", day: DAY, status: "option" },
			],
			water: undefined,
			waterTargetMl: null,
			supplements: [],
			taken: [],
			weightKg: null,
			proteinCounting: "total",
		});
		expect(full.complete).toBe(true);
		expect(full.meals[1].status).toBe("done");
		expect(full.water.percent).toBeNull();
	});
});

describe("dayReportText", () => {
	it("texto curto pra mandar no WhatsApp, com negrito no título", () => {
		const report = buildDayReport({
			day: DAY,
			meals,
			checkins: [{ mealId: "m1", day: DAY, status: "done" }],
			water: { day: DAY, ml: 1500, targetMl: 2800, entries: [] },
			waterTargetMl: null,
			supplements: [supplement("s1", "Creatina")],
			taken: ["s1"],
			weightKg: 82.4,
			proteinCounting: "total",
		});
		expect(dayReportText(report, "https://salvia.app")).toBe(
			[
				"*Meu dia na dieta: terça-feira, 17 de novembro de 2026*",
				"",
				"Refeições: 1 de 2",
				"✓ Café (07:30)",
				"– Almoço (12:30): não marcou",
				"",
				"Água: 1,5 L de 2,8 L (54%)",
				"Suplementos: 1 de 1 (Creatina)",
				"Pesagem: 82,4 kg",
				"",
				"Feito com Sálvia · https://salvia.app",
			].join("\n"),
		);
	});

	it("refeição furada; sem água, suplementos nem pesagem", () => {
		const report = buildDayReport({
			day: DAY,
			meals,
			checkins: [
				{ mealId: "m1", day: DAY, status: "done" },
				{ mealId: "m2", day: DAY, status: "skipped" },
			],
			water: undefined,
			waterTargetMl: null,
			supplements: [],
			taken: [],
			weightKg: null,
			proteinCounting: "total",
		});
		const text = dayReportText(report, "https://salvia.app");
		expect(text).toContain("✗ Almoço (12:30): furei");
		expect(text).not.toContain("Água");
		expect(text).not.toContain("Suplementos");
		expect(text).not.toContain("Pesagem");
	});
});

import { describe, expect, it } from "vitest";

import {
	factsPrompt,
	hasWeekData,
	measurementChange,
	type WeeklyFacts,
	weekStartOf,
} from "~/domains/weekly-summary/utils/weekly-summary";

describe("weekStartOf", () => {
	it("a segunda-feira da semana", () => {
		expect(weekStartOf("2026-10-20")).toBe("2026-10-19"); // terça
		expect(weekStartOf("2026-10-19")).toBe("2026-10-19"); // segunda
		expect(weekStartOf("2026-10-25")).toBe("2026-10-19"); // domingo
	});
});

describe("measurementChange", () => {
	const points = [
		{ date: "2026-09-20", value: 82 },
		{ date: "2026-10-05", value: 80.4 },
		{ date: "2026-10-12", value: 80 },
		{ date: "2026-10-19", value: 79.5 },
	];

	it("a última × a mais recente de pelo menos 6 dias antes", () => {
		expect(measurementChange(points, "2026-10-20")).toEqual({
			last: 79.5,
			change: -0.5,
		});
	});

	it("sem medida nas últimas 2 semanas, null", () => {
		expect(measurementChange(points, "2026-11-10")).toBeNull();
	});

	it("uma medida só: sem variação", () => {
		expect(
			measurementChange([{ date: "2026-10-19", value: 90 }], "2026-10-20"),
		).toEqual({ last: 90, change: null });
	});
});

const facts: WeeklyFacts = {
	objective: "lose",
	weight: { last: 79.5, change: -0.5 },
	waist: { last: 88, change: -1 },
	adherence: 85,
	fullDays: 4,
	streak: 3,
	calibration: { kind: "on-track", deltaKcal: null, weeklyKg: -0.45 },
	reviewDay: 18,
	plan: "on-target",
};

describe("hasWeekData", () => {
	it("precisa de peso ou check-in da semana", () => {
		expect(hasWeekData(facts)).toBe(true);
		expect(
			hasWeekData({ ...facts, weight: null, waist: null, adherence: null }),
		).toBe(false);
	});
});

describe("factsPrompt", () => {
	it("lista os fatos em linguagem simples", () => {
		const prompt = factsPrompt(facts);
		expect(prompt).toContain("Objetivo: perder peso");
		expect(prompt).toContain("Peso: 79,5 kg (−0,5 kg na semana)");
		expect(prompt).toContain("Cintura: 88 cm (−1 cm)");
		expect(prompt).toContain("85% das refeições");
		expect(prompt).toContain("no ritmo");
		expect(prompt).toContain("Dia 18 da dieta");
	});
});

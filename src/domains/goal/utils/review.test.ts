import { describe, expect, it } from "vitest";

import {
	carbsForKcal,
	dietDay,
	nextCheckpoint,
	previousCheckpoint,
	reviewStatus,
	weightSince,
} from "~/domains/goal/utils/review";

describe("dietDay", () => {
	it("o dia em que começou é o dia 1", () => {
		expect(dietDay("2026-10-01", "2026-10-01")).toBe(1);
		expect(dietDay("2026-10-01", "2026-10-18")).toBe(18);
	});
});

describe("nextCheckpoint", () => {
	it("15, 30 e depois a cada 30 dias", () => {
		expect(nextCheckpoint(0)).toBe(15);
		expect(nextCheckpoint(15)).toBe(30);
		expect(nextCheckpoint(30)).toBe(60);
		expect(nextCheckpoint(60)).toBe(90);
	});
});

describe("previousCheckpoint", () => {
	it("0 → 15 → 30 → 60", () => {
		expect(previousCheckpoint(15)).toBe(0);
		expect(previousCheckpoint(30)).toBe(15);
		expect(previousCheckpoint(60)).toBe(30);
		expect(previousCheckpoint(90)).toBe(60);
	});
});

describe("reviewStatus", () => {
	it("antes do marco: conta os dias que faltam", () => {
		expect(
			reviewStatus({
				startedOn: "2026-10-01",
				reviewedDay: 15,
				today: "2026-10-18",
			}),
		).toEqual({ day: 18, checkpoint: 30, due: false, daysLeft: 12 });
	});

	it("no marco sem revisar: revisão pendente", () => {
		expect(
			reviewStatus({
				startedOn: "2026-10-01",
				reviewedDay: 0,
				today: "2026-10-16",
			}),
		).toEqual({ day: 16, checkpoint: 15, due: true, daysLeft: 0 });
	});

	it("revisão de 15 feita: próxima é a de 30", () => {
		expect(
			reviewStatus({
				startedOn: "2026-10-01",
				reviewedDay: 15,
				today: "2026-10-20",
			}),
		).toMatchObject({ checkpoint: 30, due: false, daysLeft: 10 });
	});

	it("passou de vários marcos sem revisar: fica o último deles", () => {
		expect(
			reviewStatus({
				startedOn: "2026-08-01",
				reviewedDay: 0,
				today: "2026-10-05",
			}),
		).toMatchObject({ checkpoint: 60, due: true });
	});

	it("sem data de início, nada", () => {
		expect(
			reviewStatus({ startedOn: null, reviewedDay: 0, today: "2026-10-20" }),
		).toBeNull();
	});
});

describe("weightSince", () => {
	it("primeira pesagem desde o começo (até 3 dias antes) × a última", () => {
		expect(
			weightSince(
				[
					{ date: "2026-09-20", weightKg: 82 },
					{ date: "2026-09-29", weightKg: 80 },
					{ date: "2026-10-08", weightKg: 79.6 },
					{ date: "2026-10-15", weightKg: 79.1 },
				],
				"2026-10-01",
			),
		).toEqual({ fromKg: 80, toKg: 79.1, changeKg: -0.9 });
	});

	it("com menos de 2 pesagens, null", () => {
		expect(
			weightSince([{ date: "2026-10-02", weightKg: 80 }], "2026-10-01"),
		).toBeNull();
	});
});

describe("carbsForKcal", () => {
	it("kcal → gramas de carboidrato (de 5 em 5) e arroz cozido", () => {
		expect(carbsForKcal(-150)).toEqual({ carbsGrams: 40, riceGrams: 130 });
		expect(carbsForKcal(200)).toEqual({ carbsGrams: 50, riceGrams: 180 });
	});
});

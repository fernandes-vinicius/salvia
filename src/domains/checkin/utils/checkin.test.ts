import { describe, expect, it } from "vitest";

import type { Checkin } from "~/domains/checkin/types/checkin-types";
import {
	addDays,
	checkinStreak,
	isFullDay,
	weekSummary,
} from "~/domains/checkin/utils/checkin";

const TODAY = "2026-10-19"; // segunda

/** `n` refeições seguidas (comi) no dia. */
function followedDay(day: string, n: number): Checkin[] {
	return Array.from({ length: n }, (_, i) => ({
		mealId: `m${i}`,
		day,
		status: "done" as const,
	}));
}

describe("addDays", () => {
	it("cruza meses e anos", () => {
		expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
		expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
	});
});

describe("isFullDay", () => {
	it("conta comi e comi a opção, não furei", () => {
		const day: Checkin[] = [
			{ mealId: "a", day: TODAY, status: "done" },
			{ mealId: "b", day: TODAY, status: "option" },
			{ mealId: "c", day: TODAY, status: "skipped" },
		];
		expect(isFullDay(day, TODAY, 2)).toBe(true);
		expect(isFullDay(day, TODAY, 3)).toBe(false);
		expect(isFullDay([], TODAY, 0)).toBe(false);
	});
});

describe("checkinStreak", () => {
	const history = [
		...followedDay(addDays(TODAY, -3), 3),
		...followedDay(addDays(TODAY, -2), 3),
		...followedDay(addDays(TODAY, -1), 3),
	];

	it("vale até ontem enquanto hoje não está completo", () => {
		expect(checkinStreak(history, 3, TODAY)).toBe(3);
		expect(
			checkinStreak([...history, ...followedDay(TODAY, 1)], 3, TODAY),
		).toBe(3);
	});

	it("inclui hoje quando completo e para no primeiro dia furado", () => {
		expect(
			checkinStreak([...history, ...followedDay(TODAY, 3)], 3, TODAY),
		).toBe(4);
		const broken = history.filter((c) => c.day !== addDays(TODAY, -2));
		expect(checkinStreak(broken, 3, TODAY)).toBe(1);
	});
});

describe("weekSummary", () => {
	it("marca os 7 dias e calcula a adesão só nos dias com check-in", () => {
		const checkins: Checkin[] = [
			...followedDay(addDays(TODAY, -6), 4),
			...followedDay(addDays(TODAY, -1), 2),
			{ mealId: "x", day: addDays(TODAY, -1), status: "skipped" },
			{ mealId: "y", day: TODAY, status: "skipped" },
		];
		const { days, adherence } = weekSummary(checkins, 4, TODAY);
		expect(days.map((d) => d.state)).toEqual([
			"full",
			"none",
			"none",
			"none",
			"none",
			"partial",
			"skipped",
		]);
		expect(days.map((d) => d.label).join("")).toBe("TQQSSDS");
		expect(days.at(-1)?.isToday).toBe(true);
		// (4 + 2 + 0) seguidas ÷ (3 dias × 4 refeições) = 50%.
		expect(adherence).toBe(50);
		expect(weekSummary([], 4, TODAY).adherence).toBeNull();
	});
});

import { describe, expect, it } from "vitest";

import type { WaterDay } from "~/domains/water/types/water-types";
import {
	addWater,
	isWaterGoalMet,
	MAX_DAY_ML,
	parseWaterAmount,
	waterAmountLabel,
	waterCelebrationFor,
	waterStreak,
	waterWeek,
} from "~/domains/water/utils/water-log";

const TODAY = "2026-11-06";
const day = (d: string, ml: number, targetMl = 3500): WaterDay => ({
	day: d,
	ml,
	targetMl,
	entries: [],
});

describe("isWaterGoalMet", () => {
	it("bate a meta ao chegar no recomendado do dia", () => {
		expect(isWaterGoalMet([day(TODAY, 3500)], TODAY)).toBe(true);
		expect(isWaterGoalMet([day(TODAY, 3400)], TODAY)).toBe(false);
	});

	it("usa a meta guardada no dia, não a de hoje", () => {
		expect(isWaterGoalMet([day("2026-11-05", 3000, 2800)], "2026-11-05")).toBe(
			true,
		);
	});

	it("dia sem registro não bate", () => {
		expect(isWaterGoalMet([], TODAY)).toBe(false);
	});
});

describe("waterStreak", () => {
	it("conta os dias seguidos até ontem enquanto hoje não bateu", () => {
		const logs = [
			day("2026-11-03", 3500),
			day("2026-11-04", 3600),
			day("2026-11-05", 4000),
			day(TODAY, 1000),
		];
		expect(waterStreak(logs, TODAY)).toBe(3);
	});

	it("inclui hoje quando já bateu", () => {
		const logs = [day("2026-11-05", 3500), day(TODAY, 3500)];
		expect(waterStreak(logs, TODAY)).toBe(2);
	});

	it("um dia abaixo da meta quebra a sequência", () => {
		const logs = [
			day("2026-11-03", 3500),
			day("2026-11-04", 2000),
			day("2026-11-05", 3500),
		];
		expect(waterStreak(logs, TODAY)).toBe(1);
	});
});

describe("waterWeek", () => {
	it("mostra os últimos 7 dias, o último é hoje", () => {
		const week = waterWeek(
			[day("2026-11-01", 3500), day("2026-11-04", 1000), day(TODAY, 3600)],
			TODAY,
		);
		expect(week.days).toHaveLength(7);
		expect(week.days[6]).toMatchObject({ day: TODAY, isToday: true });
		expect(week.days.map((d) => d.state)).toEqual([
			"none",
			"full",
			"none",
			"none",
			"partial",
			"none",
			"full",
		]);
		expect(week.metDays).toBe(2);
	});
});

describe("waterCelebrationFor", () => {
	it("comemora quando hoje passa a bater a meta", () => {
		expect(
			waterCelebrationFor({
				before: [day(TODAY, 3000)],
				after: [day(TODAY, 3500)],
				today: TODAY,
			}),
		).toBe("day");
	});

	it("vira marco quando a sequência chega num marco", () => {
		const past = [day("2026-11-04", 3500), day("2026-11-05", 3500)];
		expect(
			waterCelebrationFor({
				before: [...past, day(TODAY, 3000)],
				after: [...past, day(TODAY, 3500)],
				today: TODAY,
			}),
		).toBe("milestone");
	});

	it("não comemora de novo nem ao tirar água", () => {
		expect(
			waterCelebrationFor({
				before: [day(TODAY, 3500)],
				after: [day(TODAY, 4000)],
				today: TODAY,
			}),
		).toBeNull();
		expect(
			waterCelebrationFor({
				before: [day(TODAY, 3500)],
				after: [day(TODAY, 3000)],
				today: TODAY,
			}),
		).toBeNull();
	});
});

describe("addWater", () => {
	it("soma e nunca fica negativo nem passa do máximo", () => {
		expect(addWater(1000, 250)).toBe(1250);
		expect(addWater(200, -500)).toBe(0);
		expect(addWater(MAX_DAY_ML - 100, 2000)).toBe(MAX_DAY_ML);
	});
});

describe("parseWaterAmount", () => {
	it("lê ml e litros", () => {
		expect(parseWaterAmount("300")).toBe(300);
		expect(parseWaterAmount("300 ml")).toBe(300);
		expect(parseWaterAmount("1,5")).toBe(1500);
		expect(parseWaterAmount("1.5 L")).toBe(1500);
		expect(parseWaterAmount("2l")).toBe(2000);
		expect(parseWaterAmount("2")).toBe(2000);
	});

	it("recusa vazio, zero e valores fora da faixa", () => {
		expect(parseWaterAmount("")).toBeNull();
		expect(parseWaterAmount("0")).toBeNull();
		expect(parseWaterAmount("abc")).toBeNull();
		expect(parseWaterAmount("9000")).toBeNull();
	});
});

describe("waterAmountLabel", () => {
	it("mostra ml abaixo de 1 L e litros acima", () => {
		expect(waterAmountLabel(250)).toBe("250 ml");
		expect(waterAmountLabel(1000)).toBe("1 L");
		expect(waterAmountLabel(1500)).toBe("1,5 L");
		expect(waterAmountLabel(2250)).toBe("2,25 L");
	});
});

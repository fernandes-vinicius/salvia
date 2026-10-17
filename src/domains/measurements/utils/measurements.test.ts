import { describe, expect, it } from "vitest";

import type { Measurement } from "~/domains/measurements/types/measurement-types";
import {
	daysBetween,
	emptyValues,
	evolutionOf,
	formatDate,
	formatShortDate,
	latestValues,
	seriesOf,
	todayIso,
} from "~/domains/measurements/utils/measurements";

function m(
	id: string,
	measuredOn: string,
	values: Partial<Measurement>,
): Measurement {
	return { ...emptyValues(), id, measuredOn, ...values };
}

// Recorte da planilha original.
const history = [
	m("3", "2025-03-10", { weightKg: 73.5, waistCm: 93 }),
	m("1", "2025-01-10", { weightKg: 72.5, waistCm: 94, chestCm: 100 }),
	m("6", "2026-09-01", { weightKg: 69, waistCm: 93, chestCm: 101 }),
];

describe("seriesOf", () => {
	it("ordena por data e pula medições sem o valor", () => {
		expect(seriesOf(history, "chestCm")).toEqual([
			{ date: "2025-01-10", value: 100 },
			{ date: "2026-09-01", value: 101 },
		]);
	});
});

describe("evolutionOf", () => {
	it("calcula a variação desde a primeira e desde a anterior", () => {
		const weight = evolutionOf(history, "weightKg");
		expect(weight?.latest).toEqual({ date: "2026-09-01", value: 69 });
		expect(weight?.sinceFirst?.delta).toBeCloseTo(-3.5);
		expect(weight?.sincePrevious?.delta).toBeCloseTo(-4.5);
	});

	it("uma medição só não tem variação; nenhuma retorna null", () => {
		expect(evolutionOf([history[0]], "weightKg")?.sinceFirst).toBeNull();
		expect(evolutionOf(history, "calfRightCm")).toBeNull();
	});
});

describe("latestValues", () => {
	it("pega o último valor conhecido de cada medida", () => {
		const values = latestValues([
			m("a", "2025-01-10", { chestCm: 100, waistCm: 94 }),
			m("b", "2025-03-10", { waistCm: 93 }),
		]);
		expect(values.chestCm).toBe(100);
		expect(values.waistCm).toBe(93);
		expect(values.neckCm).toBeNull();
	});
});

describe("datas", () => {
	it("formata sem mudar o dia por fuso", () => {
		expect(formatDate("2026-09-01")).toBe("01/09/2026");
		expect(formatShortDate("2025-03-10")).toBe("mar/25");
		expect(todayIso(new Date(2026, 9, 17, 23, 30))).toBe("2026-10-17");
	});
});

describe("daysBetween", () => {
	it("conta dias entre datas, atravessando meses e anos", () => {
		expect(daysBetween("2026-09-01", "2026-10-17")).toBe(46);
		expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
		expect(daysBetween("2026-10-17", "2026-10-17")).toBe(0);
	});
});

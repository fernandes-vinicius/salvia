import { describe, expect, it } from "vitest";

import {
	buildImport,
	columnTarget,
	findHeader,
	parseCsv,
	parseDateCell,
	parseNumberCell,
	templateCsv,
} from "~/domains/measurements/utils/measurement-import";

const today = "2026-11-04";

describe("parseCsv", () => {
	it("detects ; , and tab separators", () => {
		expect(parseCsv("Data;Peso\n01/10/2026;78,5")).toEqual([
			["Data", "Peso"],
			["01/10/2026", "78,5"],
		]);
		expect(parseCsv("Data,Peso\r\n2026-10-01,78.5\r\n")).toEqual([
			["Data", "Peso"],
			["2026-10-01", "78.5"],
		]);
		expect(parseCsv("Data\tPeso\n01/10/2026\t78")).toEqual([
			["Data", "Peso"],
			["01/10/2026", "78"],
		]);
	});

	it("handles quoted cells with separators and quotes inside", () => {
		expect(parseCsv('Data,Obs\n2026-10-01,"78,5 ""kg"""')).toEqual([
			["Data", "Obs"],
			["2026-10-01", '78,5 "kg"'],
		]);
	});

	it("ignores a UTF-8 BOM and blank lines", () => {
		expect(parseCsv("﻿Data;Peso\n\n01/10/2026;78\n")).toEqual([
			["Data", "Peso"],
			["01/10/2026", "78"],
		]);
	});
});

describe("columnTarget", () => {
	it.each([
		["Data", "date"],
		["Dia", "date"],
		["Peso (kg)", "weightKg"],
		["PESO", "weightKg"],
		["Cintura cm", "waistCm"],
		["Pescoço", "neckCm"],
		["Ombros", "shoulderCm"],
		["Tórax", "chestCm"],
		["Abdômen", "abdomenCm"],
		["Quadril", "hipsCm"],
		["Braço E", "bicepsLeftCm"],
		["Bíceps direito", "bicepsRightCm"],
		["Antebraço esq.", "forearmLeftCm"],
		["Coxa D", "thighRightCm"],
		["Panturrilha esquerda", "calfLeftCm"],
	])("%s → %s", (header, target) => {
		expect(columnTarget(header)).toBe(target);
	});

	it("uses the right side when the side is missing", () => {
		expect(columnTarget("Braço")).toBe("bicepsRightCm");
		expect(columnTarget("Coxa")).toBe("thighRightCm");
	});

	it("returns null for unknown columns", () => {
		expect(columnTarget("Observações")).toBeNull();
		expect(columnTarget("")).toBeNull();
	});
});

describe("findHeader", () => {
	it("finds the header below title rows and skips repeated targets", () => {
		const rows = [
			["Minhas medidas 2026"],
			[],
			["Data", "Peso", "Peso", "Obs"],
			["01/10/2026", "78", "79", ""],
		];
		expect(findHeader(rows)).toEqual({
			index: 2,
			mapping: ["date", "weightKg", null, null],
		});
	});

	it("returns null without a date column or any measure", () => {
		expect(findHeader([["Peso", "Cintura"]])).toBeNull();
		expect(findHeader([["Data", "Obs"]])).toBeNull();
	});
});

describe("parseDateCell", () => {
	it("reads Brazilian, ISO and Excel dates", () => {
		expect(parseDateCell("03/10/2026", today)).toBe("2026-10-03");
		expect(parseDateCell("3/10/26", today)).toBe("2026-10-03");
		expect(parseDateCell("03-10-2026", today)).toBe("2026-10-03");
		expect(parseDateCell("2026-10-03", today)).toBe("2026-10-03");
		expect(parseDateCell(new Date(Date.UTC(2026, 9, 3)), today)).toBe(
			"2026-10-03",
		);
	});

	it("rejects impossible, future and very old dates", () => {
		expect(parseDateCell("31/02/2026", today)).toBeNull();
		expect(parseDateCell("05/11/2026", today)).toBeNull();
		expect(parseDateCell("01/01/1980", today)).toBeNull();
		expect(parseDateCell("ontem", today)).toBeNull();
		expect(parseDateCell(null, today)).toBeNull();
	});
});

describe("parseNumberCell", () => {
	it("reads numbers with comma or dot and units", () => {
		expect(parseNumberCell(78.5)).toBe(78.5);
		expect(parseNumberCell("78,5")).toBe(78.5);
		expect(parseNumberCell("78.5 kg")).toBe(78.5);
		expect(parseNumberCell(" 92 cm ")).toBe(92);
	});

	it("returns null for empty or non numeric cells", () => {
		expect(parseNumberCell("")).toBeNull();
		expect(parseNumberCell("-")).toBeNull();
		expect(parseNumberCell(null)).toBeNull();
		expect(parseNumberCell("abc")).toBeNull();
	});
});

describe("buildImport", () => {
	const rows = [
		["Data", "Peso", "Cintura", "Obs"],
		["01/10/2026", "78,5", "90", "começo"],
		["08/10/2026", "78", "", ""],
		["15/10/2026", "77,6", "89", ""],
		["08/10/2026", "99", "", "repetido na planilha"],
		["sem data", "77", "", ""],
		["22/10/2026", "", "", ""],
		["29/10/2026", "500", "88", ""],
	];
	const header = findHeader(rows);
	if (!header) throw new Error("header");

	it("builds one entry per day, keeping the app's existing days", () => {
		const plan = buildImport({
			rows,
			header,
			existingDays: new Set(["2026-10-15"]),
			today,
		});

		expect(plan.entries.map((entry) => entry.measuredOn)).toEqual([
			"2026-10-01",
			"2026-10-08",
			"2026-10-29",
		]);
		expect(plan.entries[0]).toMatchObject({
			weightKg: 78.5,
			waistCm: 90,
			neckCm: null,
		});
		expect(plan.existing).toBe(1);
		expect(plan.repeated).toBe(1);
		expect(plan.skipped).toBe(2);
	});

	it("drops out of range values but keeps the rest of the row", () => {
		const plan = buildImport({ rows, header, existingDays: new Set(), today });
		const last = plan.entries.find(
			(entry) => entry.measuredOn === "2026-10-29",
		);
		expect(last).toMatchObject({ weightKg: null, waistCm: 88 });
		expect(plan.outOfRange).toBe(1);
	});

	it("sorts entries by date and reports the period", () => {
		const plan = buildImport({
			rows: [rows[0], rows[3], rows[1]],
			header,
			existingDays: new Set(),
			today,
		});
		expect(plan.entries.map((entry) => entry.measuredOn)).toEqual([
			"2026-10-01",
			"2026-10-15",
		]);
		expect(plan.first).toBe("2026-10-01");
		expect(plan.last).toBe("2026-10-15");
	});
});

describe("templateCsv", () => {
	it("is a CSV the importer reads back", () => {
		const rows = parseCsv(templateCsv());
		const header = findHeader(rows);
		expect(header?.mapping).toContain("date");
		expect(header?.mapping).toContain("calfLeftCm");
		expect(header?.mapping.filter((target) => target === null)).toEqual([]);
	});
});

import { MEASUREMENT_RANGES } from "~/domains/measurements/schemas/measurement-schema";
import type {
	MeasurementKey,
	MeasurementValues,
} from "~/domains/measurements/types/measurement-types";
import {
	fieldOf,
	MEASUREMENT_FIELDS,
	MEASUREMENT_KEYS,
} from "~/domains/measurements/utils/measurements";

/** O que uma coluna da planilha vira: a data, uma medida ou nada. */
export type ColumnTarget = "date" | MeasurementKey;
export type ColumnMapping = (ColumnTarget | null)[];
/** Célula como vem do CSV (texto) ou do Excel (número, data, texto…). */
export type Cell = string | number | boolean | Date | null | undefined;

export interface ImportHeader {
	/** Linha do cabeçalho (a planilha pode ter título antes). */
	index: number;
	mapping: ColumnMapping;
}

export interface ImportEntry extends MeasurementValues {
	measuredOn: string;
}

export interface ImportPlan {
	entries: ImportEntry[];
	/** Dias que já estão no app (ficam como estão). */
	existing: number;
	/** Dias que aparecem mais de uma vez na planilha (vale a primeira). */
	repeated: number;
	/** Linhas sem data válida ou sem nenhuma medida. */
	skipped: number;
	/** Valores fora da faixa possível, deixados em branco. */
	outOfRange: number;
	first: string | null;
	last: string | null;
}

/** Limite por importação (~3 anos de pesagem diária). */
export const MAX_IMPORT_ROWS = 1200;

// --- CSV --------------------------------------------------------------------

function detectSeparator(firstLine: string) {
	const counts = [";", ",", "\t"].map(
		(separator) => [separator, firstLine.split(separator).length] as const,
	);
	return counts.sort((a, b) => b[1] - a[1])[0][0];
}

/** CSV do Excel/Google Planilhas (`;`, `,` ou tab, aspas, BOM). */
export function parseCsv(text: string): string[][] {
	const source = text.replace(/^﻿/, "");
	const separator = detectSeparator(source.split(/\r?\n/, 1)[0] ?? "");
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let quoted = false;

	for (let i = 0; i < source.length; i++) {
		const char = source[i];
		if (quoted) {
			if (char === '"' && source[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (char === '"') {
				quoted = false;
			} else {
				cell += char;
			}
		} else if (char === '"') {
			quoted = true;
		} else if (char === separator) {
			row.push(cell);
			cell = "";
		} else if (char === "\n" || char === "\r") {
			if (char === "\r" && source[i + 1] === "\n") i++;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else {
			cell += char;
		}
	}
	row.push(cell);
	rows.push(row);

	return rows
		.map((cells) => cells.map((value) => value.trim()))
		.filter((cells) => cells.some((value) => value !== ""));
}

// --- Cabeçalho ----------------------------------------------------------------

function tokens(header: string) {
	return header
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/\(.*?\)/g, " ")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.split(" ")
		.filter((token) => token !== "" && token !== "cm" && token !== "kg");
}

const PARTS: [string[], ColumnTarget | [MeasurementKey, MeasurementKey]][] = [
	[["data", "dia", "date", "quando"], "date"],
	[["peso", "weight", "massa"], "weightKg"],
	[["cintura", "waist"], "waistCm"],
	[["pescoco", "neck"], "neckCm"],
	[["ombro", "ombros", "shoulder", "shoulders"], "shoulderCm"],
	[["peito", "peitoral", "torax", "chest"], "chestCm"],
	[["abdomen", "abdome", "abdominal", "barriga"], "abdomenCm"],
	[["quadril", "quadris", "hip", "hips", "gluteo", "gluteos"], "hipsCm"],
	[
		["antebraco", "antebracos", "forearm"],
		["forearmLeftCm", "forearmRightCm"],
	],
	[
		["biceps", "braco", "bracos", "arm"],
		["bicepsLeftCm", "bicepsRightCm"],
	],
	[
		["coxa", "coxas", "thigh"],
		["thighLeftCm", "thighRightCm"],
	],
	[
		["panturrilha", "panturrilhas", "calf"],
		["calfLeftCm", "calfRightCm"],
	],
];

const LEFT = new Set(["e", "esq", "esquerdo", "esquerda", "left", "l"]);

/** Reconhece o nome da coluna ("Braço E", "Peso (kg)", "Tórax"…). */
export function columnTarget(header: string): ColumnTarget | null {
	const words = tokens(header);
	for (const [names, target] of PARTS) {
		if (!words.some((word) => names.includes(word))) continue;
		if (typeof target === "string") return target;
		// Sem o lado, vai pro direito; a pessoa troca na prévia se for o outro.
		return words.some((word) => LEFT.has(word)) ? target[0] : target[1];
	}
	return null;
}

/** Primeira linha (até a 10ª) com a coluna da data e alguma medida. */
export function findHeader(rows: Cell[][]): ImportHeader | null {
	for (const [index, row] of rows.slice(0, 10).entries()) {
		const seen = new Set<ColumnTarget>();
		const mapping = row.map((cell) => {
			const target = columnTarget(String(cell ?? ""));
			if (!target || seen.has(target)) return null;
			seen.add(target);
			return target;
		});
		if (seen.has("date") && seen.size > 1) return { index, mapping };
	}
	return null;
}

// --- Células ------------------------------------------------------------------

function isoDate(year: number, month: number, day: number) {
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return null;
	}
	return date.toISOString().slice(0, 10);
}

/** Data da célula em "YYYY-MM-DD" (dia/mês/ano, ISO ou data do Excel). */
export function parseDateCell(cell: Cell, today: string): string | null {
	let iso: string | null = null;
	if (cell instanceof Date) {
		iso = Number.isNaN(cell.getTime())
			? null
			: isoDate(
					cell.getUTCFullYear(),
					cell.getUTCMonth() + 1,
					cell.getUTCDate(),
				);
	} else if (typeof cell === "string") {
		const value = cell.trim();
		const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
		const brMatch = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
		if (isoMatch) {
			iso = isoDate(+isoMatch[1], +isoMatch[2], +isoMatch[3]);
		} else if (brMatch) {
			const year = +brMatch[3] < 100 ? 2000 + +brMatch[3] : +brMatch[3];
			iso = isoDate(year, +brMatch[2], +brMatch[1]);
		}
	}
	if (!iso || iso > today || iso < "1990-01-01") return null;
	return iso;
}

/** Número da célula ("78,5", "78.5 kg", 92). */
export function parseNumberCell(cell: Cell): number | null {
	if (typeof cell === "number") return Number.isFinite(cell) ? cell : null;
	if (typeof cell !== "string") return null;
	const match = cell.replace(",", ".").match(/-?\d+(\.\d+)?/);
	if (!match) return null;
	const value = Number(match[0]);
	return Number.isFinite(value) ? value : null;
}

// --- Montagem -----------------------------------------------------------------

function inRange(key: MeasurementKey, value: number) {
	const range = MEASUREMENT_RANGES[fieldOf(key).unit];
	return value >= range.min && value <= range.max;
}

const emptyValues = () =>
	Object.fromEntries(
		MEASUREMENT_KEYS.map((key) => [key, null]),
	) as MeasurementValues;

/** Linhas da planilha → medições a gravar (dias do app ficam como estão). */
export function buildImport({
	rows,
	header,
	existingDays,
	today,
}: {
	rows: Cell[][];
	header: ImportHeader;
	existingDays: Set<string>;
	today: string;
}): ImportPlan {
	const dateColumn = header.mapping.indexOf("date");
	const byDay = new Map<string, ImportEntry>();
	let existing = 0;
	let repeated = 0;
	let skipped = 0;
	let outOfRange = 0;

	for (const row of rows.slice(header.index + 1)) {
		const measuredOn = parseDateCell(row[dateColumn], today);
		const values = emptyValues();
		let filled = 0;
		let rowOutOfRange = 0;
		header.mapping.forEach((target, column) => {
			if (!target || target === "date") return;
			const value = parseNumberCell(row[column]);
			if (value === null) return;
			if (!inRange(target, value)) {
				rowOutOfRange++;
				return;
			}
			values[target] = value;
			filled++;
		});

		if (!measuredOn || filled === 0) {
			skipped++;
			continue;
		}
		if (existingDays.has(measuredOn)) {
			existing++;
			continue;
		}
		if (byDay.has(measuredOn)) {
			repeated++;
			continue;
		}
		outOfRange += rowOutOfRange;
		byDay.set(measuredOn, { measuredOn, ...values });
	}

	const entries = [...byDay.values()].sort((a, b) =>
		a.measuredOn.localeCompare(b.measuredOn),
	);
	return {
		entries,
		existing,
		repeated,
		skipped,
		outOfRange,
		first: entries[0]?.measuredOn ?? null,
		last: entries.at(-1)?.measuredOn ?? null,
	};
}

/** Modelo pra baixar: as colunas do app e uma linha de exemplo. */
export function templateCsv() {
	const header = [
		"Data",
		...MEASUREMENT_FIELDS.map((field) => `${field.label} (${field.unit})`),
	];
	const example = [
		"01/10/2026",
		"78,5",
		"86",
		...MEASUREMENT_FIELDS.slice(2).map(() => ""),
	];
	return `﻿${header.join(";")}\n${example.join(";")}\n`;
}

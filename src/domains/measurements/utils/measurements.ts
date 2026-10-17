import type {
	Measurement,
	MeasurementKey,
	MeasurementValues,
} from "~/domains/measurements/types/measurement-types";

export type MeasurementGroup = "Peso" | "Tronco" | "Braços" | "Pernas";

export interface MeasurementField {
	key: MeasurementKey;
	label: string;
	/** Rótulo curto pra colunas/gráfico. */
	short: string;
	group: MeasurementGroup;
	unit: "kg" | "cm";
	/** Onde medir, em linguagem simples. */
	hint: string;
}

// Mesmas colunas da planilha de medidas, na mesma ordem.
export const MEASUREMENT_FIELDS: MeasurementField[] = [
	{
		key: "weightKg",
		label: "Peso",
		short: "Peso",
		group: "Peso",
		unit: "kg",
		hint: "Em jejum, de manhã, depois do banheiro.",
	},
	{
		key: "waistCm",
		label: "Cintura",
		short: "Cintura",
		group: "Tronco",
		unit: "cm",
		hint: "Na altura do umbigo, relaxado.",
	},
	{
		key: "neckCm",
		label: "Pescoço",
		short: "Pescoço",
		group: "Tronco",
		unit: "cm",
		hint: "Logo abaixo do pomo de adão.",
	},
	{
		key: "shoulderCm",
		label: "Ombro",
		short: "Ombro",
		group: "Tronco",
		unit: "cm",
		hint: "Contorno na parte mais larga dos ombros.",
	},
	{
		key: "chestCm",
		label: "Peito",
		short: "Peito",
		group: "Tronco",
		unit: "cm",
		hint: "Na linha dos mamilos, braços relaxados.",
	},
	{
		key: "abdomenCm",
		label: "Abdômen",
		short: "Abdômen",
		group: "Tronco",
		unit: "cm",
		hint: "Na parte mais larga da barriga.",
	},
	{
		key: "hipsCm",
		label: "Quadris",
		short: "Quadris",
		group: "Tronco",
		unit: "cm",
		hint: "Na parte mais larga do bumbum.",
	},
	{
		key: "bicepsLeftCm",
		label: "Bíceps esquerdo",
		short: "Bíceps E",
		group: "Braços",
		unit: "cm",
		hint: "No meio do braço, relaxado.",
	},
	{
		key: "bicepsRightCm",
		label: "Bíceps direito",
		short: "Bíceps D",
		group: "Braços",
		unit: "cm",
		hint: "No meio do braço, relaxado.",
	},
	{
		key: "forearmLeftCm",
		label: "Antebraço esquerdo",
		short: "Antebraço E",
		group: "Braços",
		unit: "cm",
		hint: "Na parte mais grossa, abaixo do cotovelo.",
	},
	{
		key: "forearmRightCm",
		label: "Antebraço direito",
		short: "Antebraço D",
		group: "Braços",
		unit: "cm",
		hint: "Na parte mais grossa, abaixo do cotovelo.",
	},
	{
		key: "thighLeftCm",
		label: "Coxa esquerda",
		short: "Coxa E",
		group: "Pernas",
		unit: "cm",
		hint: "No meio da coxa, em pé.",
	},
	{
		key: "thighRightCm",
		label: "Coxa direita",
		short: "Coxa D",
		group: "Pernas",
		unit: "cm",
		hint: "No meio da coxa, em pé.",
	},
	{
		key: "calfLeftCm",
		label: "Panturrilha esquerda",
		short: "Panturrilha E",
		group: "Pernas",
		unit: "cm",
		hint: "Na parte mais grossa da batata da perna.",
	},
	{
		key: "calfRightCm",
		label: "Panturrilha direita",
		short: "Panturrilha D",
		group: "Pernas",
		unit: "cm",
		hint: "Na parte mais grossa da batata da perna.",
	},
];

export const MEASUREMENT_GROUPS: MeasurementGroup[] = [
	"Peso",
	"Tronco",
	"Braços",
	"Pernas",
];

export const MEASUREMENT_KEYS = MEASUREMENT_FIELDS.map((field) => field.key);

export function fieldOf(key: MeasurementKey) {
	return MEASUREMENT_FIELDS.find(
		(field) => field.key === key,
	) as MeasurementField;
}

export function emptyValues(): MeasurementValues {
	return Object.fromEntries(
		MEASUREMENT_KEYS.map((key) => [key, null]),
	) as MeasurementValues;
}

/** "2026-09-01" → "01/09/2026" (sem passar por Date, pra não mudar o dia). */
export function formatDate(isoDate: string) {
	const [year, month, day] = isoDate.split("-");
	return `${day}/${month}/${year}`;
}

/** "2026-09-01" → "set/26" (eixo do gráfico). */
export function formatShortDate(isoDate: string) {
	const months = [
		"jan",
		"fev",
		"mar",
		"abr",
		"mai",
		"jun",
		"jul",
		"ago",
		"set",
		"out",
		"nov",
		"dez",
	];
	const [year, month] = isoDate.split("-");
	return `${months[Number(month) - 1]}/${year.slice(2)}`;
}

/** Data de hoje no fuso local, "YYYY-MM-DD". */
export function todayIso(now = new Date()) {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export interface SeriesPoint {
	date: string;
	value: number;
}

/** Pontos com valor de uma medida, do mais antigo pro mais recente. */
export function seriesOf(measurements: Measurement[], key: MeasurementKey) {
	return measurements
		.filter((m) => m[key] !== null)
		.map((m) => ({ date: m.measuredOn, value: m[key] as number }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export interface Evolution {
	latest: SeriesPoint;
	/** Variação desde a primeira medição (null se só há uma). */
	sinceFirst: { delta: number; from: SeriesPoint } | null;
	/** Variação desde a medição anterior. */
	sincePrevious: { delta: number; from: SeriesPoint } | null;
}

export function evolutionOf(
	measurements: Measurement[],
	key: MeasurementKey,
): Evolution | null {
	const points = seriesOf(measurements, key);
	const latest = points.at(-1);
	if (!latest) return null;
	const first = points[0];
	const previous = points.at(-2);
	return {
		latest,
		sinceFirst:
			points.length > 1
				? { delta: latest.value - first.value, from: first }
				: null,
		sincePrevious: previous
			? { delta: latest.value - previous.value, from: previous }
			: null,
	};
}

/** Últimos valores conhecidos de cada medida (pra pré-preencher o formulário). */
export function latestValues(measurements: Measurement[]): MeasurementValues {
	const values = emptyValues();
	const sorted = [...measurements].sort((a, b) =>
		a.measuredOn.localeCompare(b.measuredOn),
	);
	for (const m of sorted) {
		for (const key of MEASUREMENT_KEYS) {
			if (m[key] !== null) values[key] = m[key];
		}
	}
	return values;
}

import {
	HOUSEHOLD_MEASURES,
	type HouseholdMeasure,
	MEASURE_KEYWORDS,
} from "~/domains/food/data/household-measures";
import type { Food } from "~/domains/food/types/food-types";
import { normalizeSearchText } from "~/domains/food/utils/food";
import { formatNumber } from "~/shared/lib/format";

/**
 * Medidas caseiras do alimento (a primeira é a principal). Só pra quem é
 * medido em g/ml: quem já é por unidade não precisa.
 */
export function householdMeasures(
	food: Pick<Food, "name" | "unit">,
): HouseholdMeasure[] {
	if (food.unit === "unit") return [];
	const exact = HOUSEHOLD_MEASURES[food.name];
	if (exact) return exact;
	const name = normalizeSearchText(food.name);
	return (
		MEASURE_KEYWORDS.find(([keyword]) => name.includes(keyword))?.[1] ?? []
	);
}

/** Arredonda pra meia medida ("1,5 col. sopa"), no mínimo meia. */
const roundHalf = (count: number) => Math.max(0.5, Math.round(count * 2) / 2);

export interface HouseholdHint {
	measure: HouseholdMeasure;
	count: number;
	/** "≈ 4 col. sopa" (grade e PDF). */
	short: string;
	/** "≈ 4 colheres de sopa" (painel). */
	long: string;
}

/**
 * A medida que melhor descreve a quantidade: a de contagem mais "redonda"
 * entre meia e 12 medidas, evitando muitas medidas pequenas (2 escumadeiras
 * em vez de 7 colheres); empate fica com a principal. Null sem medida ou se
 * nenhuma faz sentido (ex.: 1 g de azeite).
 */
export function householdHint(
	food: Pick<Food, "name" | "unit">,
	quantity: number,
): HouseholdHint | null {
	let best: { measure: HouseholdMeasure; count: number; error: number } | null =
		null;
	for (const measure of householdMeasures(food)) {
		const exact = quantity / measure.grams;
		if (exact < 0.4 || exact > 12) continue;
		const count = roundHalf(exact);
		const error = Math.abs(exact - count) / exact + (count > 6 ? 0.1 : 0);
		if (!best || error < best.error - 0.05) best = { measure, count, error };
	}
	if (!best) return null;

	const { measure, count } = best;
	const many = count > 1;
	const value = formatNumber(count, 1);
	return {
		measure,
		count,
		short: `≈ ${value} ${many ? (measure.shortPlural ?? measure.short) : measure.short}`,
		long: `≈ ${value} ${many ? measure.plural : measure.singular}`,
	};
}

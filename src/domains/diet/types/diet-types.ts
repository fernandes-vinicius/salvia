import type { Food, Macros } from "~/domains/food/types/food-types";

/** Alternativa a um item ("ou 1 banana"); não entra nos totais. */
export interface DietItemOption {
	id: string;
	quantity: number;
	food: Food;
}

export interface DietItem {
	id: string;
	quantity: number;
	food: Food;
	options: DietItemOption[];
}

export interface DietMeal {
	id: string;
	name: string;
	/** "HH:MM" ou nulo. */
	time: string | null;
	items: DietItem[];
}

export type MacroKey = keyof Macros;

export interface MacroLine {
	grams: number;
	kcal: number;
	/** % das kcal totais do dia. */
	percent: number;
	/** g por kg de peso (null sem peso). */
	perKg: number | null;
}

/** Resumo do dia no formato da planilha (legenda "OFF"). */
export interface DietSummary {
	lines: Record<MacroKey, MacroLine>;
	kcal: number;
	/** Fibra alimentar do dia (g). */
	fiber: number;
	/** kcal planejadas − gasto diário (negativo = déficit). Null sem TMB. */
	surplus: number | null;
}

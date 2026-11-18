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
	/** No rascunho (ou na versão anterior): a refeição da dieta de onde veio. */
	sourceMealId?: string | null;
}

/**
 * Versões da dieta: a que vale (`active`), o rascunho pra experimentar
 * (`draft`) e a guardada ao usar um rascunho (`previous`, pra voltar).
 */
export type DietVariant = "active" | "draft" | "previous";

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

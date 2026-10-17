import type { Macros } from "~/domains/food/types/food-types";

/** Card de dieta pronta no dashboard, com os números já pra pessoa. */
export interface DietTemplatePreview {
	id: string;
	name: string;
	tag: string;
	description: string;
	mealCount: number;
	kcal: number;
	macros: Macros;
	/** Ajustada às metas da pessoa (false: quantidades de referência). */
	personalized: boolean;
}

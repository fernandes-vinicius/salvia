import type { ReadAmount } from "~/domains/diet-import/utils/diet-import";
import type { Food } from "~/domains/food/types/food-types";

/** Um alimento lido do documento e o que foi encontrado na base. */
export interface ImportedPortion {
	key: string;
	/** Como estava escrito ("4 colheres de arroz"). */
	text: string;
	/** Alimento casado; null = não encontrado, a pessoa escolhe na revisão. */
	food: Food | null;
	quantity: number;
	/** O que a IA leu, pra recalcular a quantidade se trocar o alimento. */
	read: ReadAmount;
}

export interface ImportedItem extends ImportedPortion {
	options: ImportedPortion[];
}

export interface ImportedMeal {
	key: string;
	name: string;
	time: string | null;
	items: ImportedItem[];
}

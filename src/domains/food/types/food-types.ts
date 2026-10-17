export type FoodUnit = "g" | "ml" | "unit";
export type ProteinSource = "animal" | "vegetal";
export type FoodSource = "taco" | "custom";

export interface Food {
	id: string;
	source: FoodSource;
	name: string;
	category: string | null;
	unit: FoodUnit;
	/** Por 100 g/ml ou por 1 unidade, conforme `unit`. */
	protein: number;
	carbs: number;
	fat: number;
	proteinSource: ProteinSource;
}

/** Alimento do usuário com o uso no plano (tela Configurações). */
export interface CustomFoodSummary extends Food {
	/** Em quantas refeições da dieta ele aparece. */
	usedInMeals: number;
}

export interface Macros {
	proteinAnimal: number;
	proteinVegetal: number;
	carbs: number;
	fat: number;
}

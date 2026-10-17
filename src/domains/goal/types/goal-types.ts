export type Objective = "lose" | "maintain" | "gain";

export interface Goal {
	objective: Objective;
	/** kcal/dia somadas ao gasto calórico (negativo = déficit). */
	calorieAdjustment: number;
	/** Proteína animal, g por kg de peso. */
	proteinPerKg: number;
	/** Gordura, g por kg de peso. */
	fatPerKg: number;
}

export interface MacroTarget {
	grams: number;
	kcal: number;
	perKg: number;
}

export interface GoalTargets {
	calories: number;
	protein: MacroTarget;
	fat: MacroTarget;
	carbs: MacroTarget;
	/** Variação estimada de peso por semana (kg; negativo = perda). */
	weeklyChangeKg: number;
	warnings: GoalWarning[];
}

export type GoalWarning = "below-bmr" | "carbs-negative" | "carbs-low";

export type Objective = "lose" | "maintain" | "gain";

export interface Goal {
	objective: Objective;
	/** kcal/dia somadas ao gasto calórico (negativo = déficit). */
	calorieAdjustment: number;
	/** Proteína animal, g por kg de peso. */
	proteinPerKg: number;
	/** Gordura, g por kg de peso. */
	fatPerKg: number;
	/** Carboidrato fixado em g/kg; `null` = automático (o que sobra). */
	carbsPerKg: number | null;
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
	/** Soma das kcal dos três macros. */
	macroCalories: number;
	/** `macroCalories − calories`: ≠ 0 só com carboidrato manual. */
	calorieGap: number;
	/** Variação estimada de peso por semana (kg; negativo = perda). */
	weeklyChangeKg: number;
	warnings: GoalWarning[];
}

export type GoalWarning = "below-bmr" | "carbs-negative" | "carbs-low";

/** Correção do gasto pelo peso real (ajuste automático da meta). */
export interface GoalCalibration {
	/** kcal/dia somadas ao gasto da fórmula (negativo = gasta menos). */
	kcal: number;
	/** "YYYY-MM-DD" do último ajuste, ou nulo se nunca ajustou. */
	since: string | null;
}

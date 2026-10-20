import type {
	Goal,
	GoalTargets,
	GoalWarning,
	Objective,
} from "~/domains/goal/types/goal-types";

export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

/** kcal ≈ 1 kg de peso corporal (aproximação usada pra ritmo semanal). */
const KCAL_PER_KG_BODY = 7700;

export interface ObjectiveOption {
	value: Objective;
	label: string;
	description: string;
}

export const OBJECTIVES: ObjectiveOption[] = [
	{
		value: "lose",
		label: "Perder peso",
		description: "Comer um pouco menos do que você gasta por dia.",
	},
	{
		value: "maintain",
		label: "Manter o peso",
		description: "Comer o mesmo tanto que você gasta por dia.",
	},
	{
		value: "gain",
		label: "Ganhar massa",
		description: "Comer um pouco mais do que você gasta, junto com treino.",
	},
];

export interface PaceOption {
	label: string;
	/** kcal/dia (com sinal). */
	adjustment: number;
}

export const PACES: Record<Objective, PaceOption[]> = {
	lose: [
		{ label: "Devagar", adjustment: -250 },
		{ label: "Recomendado", adjustment: -500 },
		{ label: "Rápido", adjustment: -750 },
	],
	maintain: [],
	gain: [
		{ label: "Devagar", adjustment: 250 },
		{ label: "Recomendado", adjustment: 500 },
	],
};

/** Faixa do ritmo personalizado (valor absoluto, kcal/dia). */
export const CUSTOM_ADJUSTMENT_RANGE = { min: 50, max: 1000 };

export const MACRO_RANGES = {
	proteinPerKg: { min: 1, max: 3, step: 0.1 },
	fatPerKg: { min: 0.5, max: 1.5, step: 0.1 },
	carbsPerKg: { min: 0.5, max: 6, step: 0.1 },
} as const;

/** Macros sugeridos pra cada objetivo (proteína + gordura, g/kg). */
export const MACRO_DEFAULTS: Record<
	Objective,
	Pick<Goal, "proteinPerKg" | "fatPerKg" | "carbsPerKg">
> = {
	lose: { proteinPerKg: 2.2, fatPerKg: 0.9, carbsPerKg: null },
	maintain: { proteinPerKg: 1.8, fatPerKg: 1, carbsPerKg: null },
	gain: { proteinPerKg: 2, fatPerKg: 1, carbsPerKg: null },
};

/** Meta padrão de um objetivo: ritmo recomendado + macros sugeridos. */
export function defaultGoalFor(objective: Objective): Goal {
	const recommended = PACES[objective].find((p) => p.label === "Recomendado");
	return {
		objective,
		calorieAdjustment: recommended?.adjustment ?? 0,
		...MACRO_DEFAULTS[objective],
	};
}

export const EXAMPLE_GOAL: Goal = defaultGoalFor("maintain");

export function findPace(objective: Objective, adjustment: number) {
	return PACES[objective].find((pace) => pace.adjustment === adjustment);
}

export function weeklyChangeKg(adjustment: number) {
	return (adjustment * 7) / KCAL_PER_KG_BODY;
}

/** Abaixo disso o carboidrato fica baixo demais pra uma dieta comum. */
const MIN_CARBS_PER_KG = 1;

export function calculateTargets(
	goal: Goal,
	{ tdee, bmr, weightKg }: { tdee: number; bmr: number; weightKg: number },
): GoalTargets {
	const calories = tdee + goal.calorieAdjustment;

	const proteinGrams = goal.proteinPerKg * weightKg;
	const fatGrams = goal.fatPerKg * weightKg;
	const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
	const fatKcal = fatGrams * KCAL_PER_GRAM.fat;

	// Automático: carboidrato = o que sobra da meta (pode ficar negativo se
	// proteína + gordura passarem dela; aí vira aviso e mostramos 0).
	// Manual: g/kg fixado pelo usuário, como na planilha; a soma dos macros
	// pode então não fechar com a meta (`calorieGap`).
	const isCarbsAuto = goal.carbsPerKg === null;
	const carbsGrams = isCarbsAuto
		? (calories - proteinKcal - fatKcal) / KCAL_PER_GRAM.carbs
		: (goal.carbsPerKg ?? 0) * weightKg;
	const safeCarbsGrams = Math.max(0, carbsGrams);
	const carbsKcal = safeCarbsGrams * KCAL_PER_GRAM.carbs;
	const macroCalories = proteinKcal + fatKcal + carbsKcal;

	const warnings: GoalWarning[] = [];
	if (calories < bmr) warnings.push("below-bmr");
	if (isCarbsAuto && carbsGrams < 0) warnings.push("carbs-negative");
	else if (isCarbsAuto && carbsGrams / weightKg < MIN_CARBS_PER_KG) {
		warnings.push("carbs-low");
	}

	return {
		calories,
		protein: {
			grams: proteinGrams,
			kcal: proteinKcal,
			perKg: goal.proteinPerKg,
		},
		fat: { grams: fatGrams, kcal: fatKcal, perKg: goal.fatPerKg },
		carbs: {
			grams: safeCarbsGrams,
			kcal: carbsKcal,
			perKg: safeCarbsGrams / weightKg,
		},
		macroCalories,
		calorieGap: macroCalories - calories,
		weeklyChangeKg: weeklyChangeKg(goal.calorieAdjustment),
		warnings,
	};
}

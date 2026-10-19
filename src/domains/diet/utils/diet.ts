import type {
	DietItem,
	DietMeal,
	DietSummary,
	MacroKey,
	MacroLine,
} from "~/domains/diet/types/diet-types";
import type { Food, Macros } from "~/domains/food/types/food-types";
import {
	fiberFor,
	kcalFor,
	macrosFor,
	quantityRangeFor,
	sumMacros,
} from "~/domains/food/utils/food";

export const MACRO_KEYS: MacroKey[] = [
	"proteinAnimal",
	"proteinVegetal",
	"carbs",
	"fat",
];

const KCAL_PER_GRAM: Record<MacroKey, number> = {
	proteinAnimal: 4,
	proteinVegetal: 4,
	carbs: 4,
	fat: 9,
};

export function itemMacros(item: Pick<DietItem, "food" | "quantity">): Macros {
	return macrosFor(item.food, item.quantity);
}

export function mealMacros(meal: DietMeal): Macros {
	return sumMacros(meal.items.map(itemMacros));
}

export function dayMacros(meals: DietMeal[]): Macros {
	return sumMacros(meals.map(mealMacros));
}

export function summarizeDiet(
	meals: DietMeal[],
	{ weightKg, tdee }: { weightKg: number | null; tdee: number | null },
): DietSummary {
	const macros = dayMacros(meals);
	const kcal = kcalFor(macros);

	const lines = Object.fromEntries(
		MACRO_KEYS.map((key): [MacroKey, MacroLine] => {
			const grams = macros[key];
			const lineKcal = grams * KCAL_PER_GRAM[key];
			return [
				key,
				{
					grams,
					kcal: lineKcal,
					percent: kcal > 0 ? (lineKcal * 100) / kcal : 0,
					perKg: weightKg ? grams / weightKg : null,
				},
			];
		}),
	) as Record<MacroKey, MacroLine>;

	return {
		lines,
		kcal,
		fiber: dayFiber(meals),
		surplus: tdee === null ? null : kcal - tdee,
	};
}

export function dayFiber(meals: DietMeal[]) {
	return meals.reduce(
		(sum, meal) =>
			sum +
			meal.items.reduce(
				(mealSum, item) => mealSum + fiberFor(item.food, item.quantity),
				0,
			),
		0,
	);
}

// --- Planejado × meta -------------------------------------------------------

/** Até ±3% da meta conta como "na meta". */
export const TARGET_TOLERANCE = 0.03;

export function withinTarget(planned: number, target: number) {
	return target > 0 && Math.abs(planned - target) <= target * TARGET_TOLERANCE;
}

/**
 * A dieta bate a meta: calorias, proteína animal, carboidrato e gordura,
 * todos dentro da tolerância (o "Na meta" em todas as linhas do card).
 */
export function isOnTarget(
	summary: DietSummary,
	targets: {
		calories: number;
		protein: { grams: number };
		carbs: { grams: number };
		fat: { grams: number };
	},
) {
	return (
		withinTarget(summary.kcal, targets.calories) &&
		withinTarget(summary.lines.proteinAnimal.grams, targets.protein.grams) &&
		withinTarget(summary.lines.carbs.grams, targets.carbs.grams) &&
		withinTarget(summary.lines.fat.grams, targets.fat.grams)
	);
}

// --- Fibras -----------------------------------------------------------------

/** Mínimo da OMS pra adultos (diretriz de carboidratos, 2023). */
export const FIBER_MIN_GRAMS = 25;
/** Referência americana (IOM): 14 g a cada 1.000 kcal. */
const FIBER_PER_1000_KCAL = 14;

/**
 * Fibra recomendada pro dia: pelo menos 25 g (OMS) ou 14 g a cada
 * 1.000 kcal planejadas, o que for maior.
 */
export function fiberTarget(kcal: number) {
	return Math.max(
		FIBER_MIN_GRAMS,
		Math.round((kcal * FIBER_PER_1000_KCAL) / 1000),
	);
}

/** Próximo nome livre: "Refeição 4" se já existem 1–3. */
export function nextMealName(meals: Pick<DietMeal, "name">[]) {
	const used = new Set(meals.map((meal) => meal.name));
	let n = meals.length + 1;
	while (used.has(`Refeição ${n}`)) n++;
	return `Refeição ${n}`;
}

// --- Opções do item ---------------------------------------------------------

/** Opções por item ("ou 1 banana"); mais que isso vira bagunça na grade. */
export const MAX_ITEM_OPTIONS = 3;

// --- Substituir alimento ----------------------------------------------------

export type SwapMacro = "protein" | "carbs" | "fat";

export interface Equivalent {
	quantity: number;
	/** Macro que guiou a troca (o que mais pesa nas kcal do item original). */
	macro: SwapMacro;
	/** Gramas desse macro no item original. */
	grams: number;
}

/**
 * Quantidade do alimento novo que entrega o mesmo macro principal do item
 * (ex.: 100 g de arroz → batata com os mesmos 28 g de carboidrato),
 * arredondada ao passo do editor. Null se o item não tem macros ou o
 * alimento novo não tem esse macro.
 */
export function equivalentQuantity(
	item: Pick<DietItem, "food" | "quantity">,
	food: Pick<Food, "unit" | "protein" | "carbs" | "fat">,
): Equivalent | null {
	const macros = itemMacros(item);
	const grams: Record<SwapMacro, number> = {
		protein: macros.proteinAnimal + macros.proteinVegetal,
		carbs: macros.carbs,
		fat: macros.fat,
	};
	const kcal: Record<SwapMacro, number> = {
		protein: grams.protein * 4,
		carbs: grams.carbs * 4,
		fat: grams.fat * 9,
	};
	const macro = (["protein", "carbs", "fat"] as const).reduce((best, key) =>
		kcal[key] > kcal[best] ? key : best,
	);
	const perBase = food[macro];
	if (grams[macro] <= 0 || perBase <= 0) return null;

	const range = quantityRangeFor(food.unit);
	const raw = (grams[macro] / perBase) * (food.unit === "unit" ? 1 : 100);
	const rounded = Math.round(raw / range.step) * range.step;
	const quantity = Math.min(range.max, Math.max(range.min, rounded));
	return { quantity, macro, grams: grams[macro] };
}

// --- Arrastar e soltar ------------------------------------------------------

export function findMealOfItem(meals: DietMeal[], itemId: string) {
	return meals.find((meal) => meal.items.some((item) => item.id === itemId));
}

/** Move o item pra `toMealId` na posição `toIndex` (limitada ao tamanho). */
export function moveItemTo(
	meals: DietMeal[],
	itemId: string,
	toMealId: string,
	toIndex: number,
): DietMeal[] {
	const from = findMealOfItem(meals, itemId);
	const item = from?.items.find((i) => i.id === itemId);
	if (!from || !item) return meals;

	const withoutItem = meals.map((meal) =>
		meal.id === from.id
			? { ...meal, items: meal.items.filter((i) => i.id !== itemId) }
			: meal,
	);
	return withoutItem.map((meal) => {
		if (meal.id !== toMealId) return meal;
		const index = Math.max(0, Math.min(toIndex, meal.items.length));
		const items = [...meal.items];
		items.splice(index, 0, item);
		return { ...meal, items };
	});
}

/** Refeições cuja lista de itens mudou entre `before` e `after`. */
export function changedLayouts(before: DietMeal[], after: DietMeal[]) {
	const idsOf = (meal: DietMeal) => meal.items.map((item) => item.id).join(",");
	const previous = new Map(before.map((meal) => [meal.id, idsOf(meal)]));
	return after
		.filter((meal) => previous.get(meal.id) !== idsOf(meal))
		.map((meal) => ({
			mealId: meal.id,
			itemIds: meal.items.map((item) => item.id),
		}));
}

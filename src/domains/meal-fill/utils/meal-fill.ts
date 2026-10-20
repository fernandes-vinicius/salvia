import type { DietSummary } from "~/domains/diet/types/diet-types";
import { summaryProtein } from "~/domains/diet/utils/diet";
import type { Food, Macros } from "~/domains/food/types/food-types";
import {
	kcalFor,
	macrosFor,
	quantityRangeFor,
	sumMacros,
} from "~/domains/food/utils/food";
import {
	countedProtein,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";

// "Completar com IA": a IA só escolhe os alimentos (pelos códigos); as
// quantidades saem daqui, pra cobrir o que falta da meta do dia. Ordem:
// proteína, carboidrato e gordura, descontando o que cada alimento já trouxe
// dos outros macros.

export type FillRole = "protein" | "carbs" | "fat";

export interface MacroGap {
	protein: number;
	carbs: number;
	fat: number;
	kcal: number;
}

interface Targets {
	calories: number;
	protein: { grams: number };
	carbs: { grams: number };
	fat: { grams: number };
}

/** Quanto falta pra meta do dia (0 quando já passou). */
export function macroGap(
	summary: DietSummary,
	targets: Targets,
	counting: ProteinCounting,
): MacroGap {
	const left = (target: number, planned: number) =>
		Math.max(0, target - planned);
	return {
		protein: left(targets.protein.grams, summaryProtein(summary, counting)),
		carbs: left(targets.carbs.grams, summary.lines.carbs.grams),
		fat: left(targets.fat.grams, summary.lines.fat.grams),
		kcal: left(targets.calories, summary.kcal),
	};
}

/** Falta o bastante pra valer uma refeição (ou um complemento)? */
export function hasMeaningfulGap(gap: MacroGap) {
	return gap.kcal >= 80 || gap.protein >= 8 || gap.carbs >= 15 || gap.fat >= 6;
}

/** O macro que mais pesa nas kcal do alimento. */
export function mainMacro(
	food: Pick<Food, "protein" | "carbs" | "fat">,
): FillRole {
	const kcal = {
		protein: food.protein * 4,
		carbs: food.carbs * 4,
		fat: food.fat * 9,
	};
	return (["protein", "carbs", "fat"] as const).reduce((best, key) =>
		kcal[key] > kcal[best] ? key : best,
	);
}

/** Abaixo disso o macro "já está coberto" e o alimento sai da sugestão. */
const COVERED = { protein: 4, carbs: 8, fat: 3 } as const;
/** Porção máxima de um alimento (g/ml), como nas trocas. */
const MAX_PORTION = 500;

const ROLE_ORDER: FillRole[] = ["protein", "carbs", "fat"];

function roleGrams(macros: Macros, role: FillRole, counting: ProteinCounting) {
	if (role === "protein") return countedProtein(macros, counting);
	return macros[role];
}

export interface FillItem {
	food: Food;
	quantity: number;
	role: FillRole;
}

/** Quantidades que cobrem o que falta, no passo do editor. */
export function fillQuantities(
	foods: Food[],
	gap: MacroGap,
	counting: ProteinCounting,
): FillItem[] {
	const remaining = { protein: gap.protein, carbs: gap.carbs, fat: gap.fat };
	const items: FillItem[] = [];

	for (const role of ROLE_ORDER) {
		const picks = foods.filter((food) => mainMacro(food) === role);
		for (const [index, food] of picks.entries()) {
			const need = remaining[role] / (picks.length - index);
			if (need < COVERED[role]) continue;

			const perUnit = roleGrams(macrosFor(food, 1), role, counting);
			if (perUnit <= 0) continue;
			const range = quantityRangeFor(food.unit);
			const max = food.unit === "unit" ? range.max : MAX_PORTION;
			const quantity = Math.min(
				max,
				Math.round(need / perUnit / range.step) * range.step,
			);
			if (quantity < range.min) continue;

			const macros = macrosFor(food, quantity);
			remaining.protein -= countedProtein(macros, counting);
			remaining.carbs -= macros.carbs;
			remaining.fat -= macros.fat;
			items.push({ food, quantity, role });
		}
	}
	return items;
}

/** Macros e kcal somados dos itens sugeridos. */
export function fillTotals(items: Pick<FillItem, "food" | "quantity">[]) {
	const macros = sumMacros(
		items.map((item) => macrosFor(item.food, item.quantity)),
	);
	return { macros, kcal: kcalFor(macros) };
}

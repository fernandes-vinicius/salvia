import type {
	DietItem,
	DietMeal,
	DietSummary,
	MacroKey,
	MacroLine,
} from "~/domains/diet/types/diet-types";
import type { Macros } from "~/domains/food/types/food-types";
import { kcalFor, macrosFor, sumMacros } from "~/domains/food/utils/food";

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

export function itemMacros(item: DietItem): Macros {
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

	return { lines, kcal, surplus: tdee === null ? null : kcal - tdee };
}

/** Próximo nome livre: "Refeição 4" se já existem 1–3. */
export function nextMealName(meals: Pick<DietMeal, "name">[]) {
	const used = new Set(meals.map((meal) => meal.name));
	let n = meals.length + 1;
	while (used.has(`Refeição ${n}`)) n++;
	return `Refeição ${n}`;
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

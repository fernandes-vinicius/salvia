import type { Food, FoodUnit, Macros } from "~/domains/food/types/food-types";
import { macrosFor, sumMacros } from "~/domains/food/utils/food";

// Receita salva: guarda a "foto" da refeição no momento em que foi salva,
// porque a dieta pode mudar depois.

export interface RecipeIngredient {
	/** Pra comparar com a refeição atual (o alimento pode ter sido apagado). */
	foodId: string;
	name: string;
	unit: FoodUnit;
	quantity: number;
	/** Troca da receita: o alimento que estava na dieta (`recipe-swap`). */
	replaces?: Omit<RecipeIngredient, "replaces">;
}

export interface RecipeSnapshot {
	ingredients: RecipeIngredient[];
	macros: Macros;
}

type MealItem = { food: Food; quantity: number };

const ingredientOf = ({ food, quantity }: MealItem) => ({
	foodId: food.id,
	name: food.name,
	unit: food.unit,
	quantity,
});

export function recipeSnapshot(
	items: (MealItem & { replaces?: MealItem })[],
): RecipeSnapshot {
	return {
		ingredients: items.map((item) =>
			item.replaces
				? { ...ingredientOf(item), replaces: ingredientOf(item.replaces) }
				: ingredientOf(item),
		),
		macros: sumMacros(items.map((item) => macrosFor(item.food, item.quantity))),
	};
}

const signature = (entries: { foodId: string; quantity: number }[]) =>
	entries
		.map((entry) => `${entry.foodId}:${entry.quantity}`)
		.sort()
		.join("|");

/** A refeição de origem tem outros alimentos ou quantidades desde que salvou? */
export function mealChangedSince(saved: RecipeIngredient[], items: MealItem[]) {
	return (
		signature(saved.map((entry) => entry.replaces ?? entry)) !==
		signature(
			items.map((item) => ({ foodId: item.food.id, quantity: item.quantity })),
		)
	);
}

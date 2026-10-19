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
}

export interface RecipeSnapshot {
	ingredients: RecipeIngredient[];
	macros: Macros;
}

type MealItem = { food: Food; quantity: number };

export function recipeSnapshot(items: MealItem[]): RecipeSnapshot {
	return {
		ingredients: items.map(({ food, quantity }) => ({
			foodId: food.id,
			name: food.name,
			unit: food.unit,
			quantity,
		})),
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
		signature(saved) !==
		signature(
			items.map((item) => ({ foodId: item.food.id, quantity: item.quantity })),
		)
	);
}

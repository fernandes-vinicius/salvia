import type { DietMeal } from "~/domains/diet/types/diet-types";
import { macrosFor, sumMacros } from "~/domains/food/utils/food";
import {
	mealPrompt,
	type PromptSwap,
	type RecipeItem,
} from "~/domains/meal-recipe/utils/meal-recipe";
import {
	applySwaps,
	type RecipeSwap,
	type SwapItem,
} from "~/domains/meal-recipe/utils/recipe-swap";

// Regras puras do "Variar refeição": a IA escolhe, entre as trocas
// equivalentes calculadas no servidor, um conjunto que combine.

/** A refeição como vai pro prompt: nome, horário e alimentos com trocas. */
export function variationPrompt(
	meal: Pick<DietMeal, "name" | "time">,
	items: (RecipeItem & { swaps?: PromptSwap[] })[],
) {
	return [
		`Refeição: ${meal.name}${meal.time ? ` (${meal.time})` : ""}`,
		"Alimentos:",
		mealPrompt(items),
	].join("\n");
}

/** Macros da refeição atual e da versão com as trocas. */
export function variationTotals(items: SwapItem[], swaps: RecipeSwap[]) {
	const total = (list: { food: SwapItem["food"]; quantity: number }[]) =>
		sumMacros(list.map((item) => macrosFor(item.food, item.quantity)));
	return { before: total(items), after: total(applySwaps(items, swaps)) };
}

/** "Aveia → Pão integral": identifica a combinação pra não repetir. */
export function variationKey(items: SwapItem[], swaps: RecipeSwap[]) {
	return applySwaps(items, swaps)
		.flatMap((item) =>
			item.replaces ? [`${item.replaces.food.name} → ${item.food.name}`] : [],
		)
		.join("; ");
}

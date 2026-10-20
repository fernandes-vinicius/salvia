import "server-only";

import { foodsForSwaps } from "~/domains/food/services/food-service";
import { SWAP_FOODS } from "~/domains/meal-recipe/data/swap-foods";
import type { PromptSwap } from "~/domains/meal-recipe/utils/meal-recipe";
import {
	type SwapCandidateOptions,
	type SwapItem,
	swapCandidates,
} from "~/domains/meal-recipe/utils/recipe-swap";

export interface SwapOptionsConfig extends SwapCandidateOptions {
	/** Inclui os alimentos cadastrados pela pessoa (variar refeição). */
	withCustom?: boolean;
}

/**
 * As trocas possíveis de cada item da refeição, com códigos (T1, T2…) que
 * a IA devolve quando usa uma. Um select só pra base inteira.
 */
export async function swapOptionsFor<T extends SwapItem>(
	userId: string,
	items: T[],
	{ withCustom = false, ...options }: SwapOptionsConfig = {},
): Promise<(T & { swaps: (PromptSwap & Pick<SwapItem, "food">)[] })[]> {
	const foods = await foodsForSwaps(userId, SWAP_FOODS, withCustom);
	let code = 0;
	return items.map((item) => ({
		...item,
		swaps: swapCandidates(item, foods, options).map((candidate) => ({
			code: `T${++code}`,
			...candidate,
		})),
	}));
}

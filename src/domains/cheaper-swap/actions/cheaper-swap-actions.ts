"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	type CheaperSwapSuggestion,
	suggestCheaperSwapInputSchema,
} from "~/domains/cheaper-swap/schemas/cheaper-swap-schema";
import { suggestCheaperSwap } from "~/domains/cheaper-swap/services/cheaper-swap-service";
import {
	cheaperSwaps,
	pickCheaperSwap,
} from "~/domains/cheaper-swap/utils/cheaper-swap";
import { getDiet } from "~/domains/diet/services/diet-service";
import { foodsForSwaps } from "~/domains/food/services/food-service";
import { SWAP_FOODS } from "~/domains/meal-recipe/data/swap-foods";
import { isLightMeal } from "~/domains/meal-recipe/utils/recipe-swap";
import { listUserPrices } from "~/domains/shopping/services/price-service";

/**
 * Troca mais em conta pro item (ao abrir o painel do alimento): o servidor
 * acha os equivalentes mais baratos e a IA escolhe o que combina com a
 * refeição. Sem opção mais barata, null e nem chama a IA; sem IA (limite,
 * erro), a que economiza mais, sem a frase.
 */
export async function suggestCheaperSwapAction(
	input: unknown,
): Promise<CheaperSwapSuggestion | null> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) return null;
	const parsed = suggestCheaperSwapInputSchema.safeParse(input);
	if (!parsed.success) return null;

	const meals = await getDiet(user.id, { createIfEmpty: false });
	const meal = meals.find((entry) =>
		entry.items.some((item) => item.id === parsed.data.itemId),
	);
	const item = meal?.items.find((entry) => entry.id === parsed.data.itemId);
	if (!meal || !item) return null;

	const [foods, prices] = await Promise.all([
		foodsForSwaps(user.id, SWAP_FOODS),
		listUserPrices(user.id),
	]);
	const options = cheaperSwaps(item, foods, new Map(prices), {
		light: isLightMeal(meal),
	});
	if (options.length === 0) return null;

	const best = { food: options[0].food, insight: null };
	if (!(await consumeAiQuota(user.id, "cheaper-swap"))) return best;
	const others = meal.items.filter((entry) => entry.id !== item.id);
	const choice = await suggestCheaperSwap(meal, item, others, options);
	if (!choice) {
		await refundAiQuota(user.id, "cheaper-swap");
		return best;
	}
	const picked = pickCheaperSwap(options, choice.code) ?? options[0];
	return { food: picked.food, insight: choice.insight.trim() || null };
}

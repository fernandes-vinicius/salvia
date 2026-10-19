import "server-only";

import type { ExtractedDiet } from "~/domains/diet-import/schemas/diet-import-schema";
import type {
	ImportedMeal,
	ImportedPortion,
} from "~/domains/diet-import/types/diet-import-types";
import {
	bestMatch,
	importedQuantity,
	mealTime,
	searchQueriesFor,
} from "~/domains/diet-import/utils/diet-import";
import { searchFoods } from "~/domains/food/services/food-service";
import type { Food } from "~/domains/food/types/food-types";

type ReadFood = ExtractedDiet["meals"][number]["items"][number];

/**
 * Casa cada alimento lido com a base (alimentos da pessoa primeiro, depois a
 * TACO): busca o nome inteiro e versões mais curtas, e escolhe o resultado
 * com mais palavras em comum (`bestMatch`). O que não for encontrado volta
 * com `food: null` pra pessoa escolher na revisão.
 */
export async function matchExtractedDiet(
	userId: string,
	diet: ExtractedDiet,
): Promise<ImportedMeal[]> {
	const cache = new Map<string, Promise<Food | null>>();
	const findFood = (name: string) => {
		const key = name.trim().toLowerCase();
		let found = cache.get(key);
		if (!found) {
			// Junta os resultados das buscas (da mais específica pra mais
			// genérica) e fica com o de mais palavras em comum.
			found = Promise.all(
				searchQueriesFor(name).map((query) => searchFoods(userId, query)),
			).then((lists) => {
				const seen = new Set<string>();
				const candidates = lists.flat().filter((food) => {
					if (seen.has(food.id)) return false;
					seen.add(food.id);
					return true;
				});
				return bestMatch(name, candidates);
			});
			cache.set(key, found);
		}
		return found;
	};

	let counter = 0;
	const portion = async (read: Omit<ReadFood, "options">) => {
		const food = await findFood(read.food);
		const amount = { grams: read.grams, units: read.units };
		return {
			key: `p${counter++}`,
			text: read.text,
			food,
			quantity: food ? importedQuantity(food.unit, amount) : 0,
			read: amount,
		} satisfies ImportedPortion;
	};

	return Promise.all(
		diet.meals.map(async (meal, mealIndex) => ({
			key: `m${mealIndex}`,
			name: meal.name.trim().slice(0, 40) || `Refeição ${mealIndex + 1}`,
			time: mealTime(meal.time),
			items: await Promise.all(
				meal.items.map(async ({ options, ...item }) => ({
					...(await portion(item)),
					options: await Promise.all(options.map(portion)),
				})),
			),
		})),
	);
}

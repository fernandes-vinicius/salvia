import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import {
	TEMPLATE_CUSTOM_FOODS,
	TEMPLATE_TACO_IDS,
} from "~/domains/diet-templates/data/templates";
import type { ResolvedTemplateMeal } from "~/domains/diet-templates/types/diet-template-types";
import {
	PENDING_CUSTOM_PREFIX,
	type TemplateFoods,
} from "~/domains/diet-templates/utils/resolve";
import { foodColumns } from "~/domains/food/services/food-service";
import { normalizeSearchText } from "~/domains/food/utils/food";
import { db } from "~/shared/db";
import { dietItem, dietMeal, food } from "~/shared/db/schema";

/** Alimentos usados pelos modelos: TACO + os próprios do usuário com o mesmo nome. */
export async function getTemplateFoods(userId: string): Promise<TemplateFoods> {
	const customNames = Object.entries(TEMPLATE_CUSTOM_FOODS).map(
		([key, values]) => [key, normalizeSearchText(values.name)] as const,
	);

	const [tacoRows, customRows] = await Promise.all([
		db
			.select({ ...foodColumns, tacoId: food.tacoId })
			.from(food)
			.where(inArray(food.tacoId, TEMPLATE_TACO_IDS)),
		customNames.length > 0
			? db
					.select({ ...foodColumns, searchName: food.searchName })
					.from(food)
					.where(
						and(
							eq(food.userId, userId),
							eq(food.source, "custom"),
							inArray(
								food.searchName,
								customNames.map(([, name]) => name),
							),
						),
					)
			: [],
	]);

	const taco = new Map(
		tacoRows.map(({ tacoId, ...row }) => [tacoId as number, row]),
	);
	const custom = new Map(
		customNames.flatMap(([key, name]) => {
			const row = customRows.find((r) => r.searchName === name);
			if (!row) return [];
			const { searchName: _, ...rest } = row;
			return [[key, rest] as const];
		}),
	);
	return { taco, custom };
}

/**
 * Substitui a dieta do usuário pelas refeições do modelo (já personalizadas),
 * numa transação: cria os alimentos próprios que faltam, apaga as refeições
 * atuais (itens vão junto, cascade) e grava as novas.
 */
export async function applyTemplateMeals(
	userId: string,
	meals: ResolvedTemplateMeal[],
) {
	await db.transaction(async (tx) => {
		const createdIds = new Map<string, string>();
		for (const meal of meals) {
			for (const { food: item } of meal.items) {
				if (!item.id.startsWith(PENDING_CUSTOM_PREFIX)) continue;
				if (createdIds.has(item.id)) continue;
				const [row] = await tx
					.insert(food)
					.values({
						userId,
						source: "custom",
						name: item.name,
						searchName: normalizeSearchText(item.name),
						unit: item.unit,
						protein: item.protein,
						carbs: item.carbs,
						fat: item.fat,
						proteinSource: item.proteinSource,
					})
					.returning({ id: food.id });
				createdIds.set(item.id, row.id);
			}
		}

		await tx.delete(dietMeal).where(eq(dietMeal.userId, userId));

		for (const [position, meal] of meals.entries()) {
			const [row] = await tx
				.insert(dietMeal)
				.values({ userId, name: meal.name, time: meal.time, position })
				.returning({ id: dietMeal.id });
			if (meal.items.length === 0) continue;
			await tx.insert(dietItem).values(
				meal.items.map((item, index) => ({
					mealId: row.id,
					foodId: createdIds.get(item.food.id) ?? item.food.id,
					quantity: item.quantity,
					position: index,
				})),
			);
		}
	});
}

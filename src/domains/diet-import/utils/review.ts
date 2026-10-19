import { MAX_ITEM_OPTIONS } from "~/domains/diet/utils/diet";
import type { ImportedDietInput } from "~/domains/diet-import/schemas/diet-import-schema";
import type {
	ImportedMeal,
	ImportedPortion,
} from "~/domains/diet-import/types/diet-import-types";

// Regras da tela de revisão da dieta importada.

/** Itens e opções que ficaram sem alimento (a pessoa escolhe ou tira). */
export function pendingCount(meals: ImportedMeal[]) {
	return meals
		.flatMap((meal) => meal.items.flatMap((item) => [item, ...item.options]))
		.filter((portion) => portion.food === null).length;
}

export interface PortionPath {
	meal: string;
	item: string;
	/** Sem ele, o caminho é o próprio item. */
	option?: string;
}

/** Altera (ou remove, devolvendo null) um item ou opção pelo caminho. */
export function editPortion(
	meals: ImportedMeal[],
	path: PortionPath,
	fn: (portion: ImportedPortion) => ImportedPortion | null,
): ImportedMeal[] {
	return meals.map((meal) => {
		if (meal.key !== path.meal) return meal;
		const items = meal.items.flatMap((item) => {
			if (item.key !== path.item) return [item];
			if (path.option === undefined) {
				const next = fn(item);
				return next ? [{ ...item, ...next }] : [];
			}
			const options = item.options.flatMap((option) => {
				if (option.key !== path.option) return [option];
				const next = fn(option);
				return next ? [next] : [];
			});
			return [{ ...item, options }];
		});
		return { ...meal, items };
	});
}

/** O que vai pro servidor: só o que tem alimento, sem refeições vazias. */
export function toImportInput(meals: ImportedMeal[]): ImportedDietInput {
	const portion = (p: ImportedPortion) =>
		p.food ? [{ foodId: p.food.id, quantity: p.quantity }] : [];
	return {
		meals: meals
			.map((meal) => ({
				name: meal.name,
				time: meal.time,
				items: meal.items.flatMap((item) =>
					portion(item).map((main) => ({
						...main,
						options: item.options.flatMap(portion).slice(0, MAX_ITEM_OPTIONS),
					})),
				),
			}))
			.filter((meal) => meal.items.length > 0),
	};
}

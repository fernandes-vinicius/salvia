import type { Food } from "~/domains/food/types/food-types";
import { normalizeSearchText } from "~/domains/food/utils/food";
import {
	type FillRole,
	type MacroGap,
	mainMacro,
} from "~/domains/meal-fill/utils/meal-fill";
import { mealPrompt } from "~/domains/meal-recipe/utils/meal-recipe";
import { formatNumber } from "~/shared/lib/format";

const ROLE_NAMES: Record<FillRole, string> = {
	protein: "proteína",
	carbs: "carboidrato",
	fat: "gordura",
};

/** Abaixo disso o macro não entra no pedido (não vale um alimento). */
const MIN_GAP: Record<FillRole, number> = { protein: 8, carbs: 15, fat: 6 };

/** Macros que ainda pedem um alimento. */
export function rolesToFill(gap: MacroGap): FillRole[] {
	return (["protein", "carbs", "fat"] as const).filter(
		(role) => gap[role] >= MIN_GAP[role],
	);
}

export interface FillCandidate {
	code: string;
	food: Food;
}

/**
 * Alimentos que a IA pode escolher: comuns da TACO e os da pessoa, só dos
 * macros que faltam. Em café, lanche e ceia, sem comida de prato.
 */
export function fillCandidates(
	foods: Food[],
	gap: MacroGap,
	{ excludeNames = [] }: { excludeNames?: string[] } = {},
): FillCandidate[] {
	const roles = new Set(rolesToFill(gap));
	const excluded = new Set(excludeNames.map(normalizeSearchText));
	return foods
		.filter(
			(food) =>
				!excluded.has(normalizeSearchText(food.name)) &&
				roles.has(mainMacro(food)),
		)
		.map((food, index) => ({ code: `F${index + 1}`, food }));
}

export function fillPrompt({
	meal,
	gap,
	candidates,
	avoid,
}: {
	meal: {
		name: string;
		time: string | null;
		items: { food: Food; quantity: number }[];
	};
	gap: MacroGap;
	candidates: FillCandidate[];
	avoid: string[];
}) {
	const roles = rolesToFill(gap);
	return [
		`Refeição: ${meal.name}${meal.time ? ` (${meal.time})` : ""}`,
		meal.items.length > 0
			? `Já tem:\n${mealPrompt(meal.items)}`
			: "A refeição está vazia.",
		`Falta no dia: ${roles.map((role) => `${formatNumber(gap[role])} g de ${ROLE_NAMES[role]}`).join(", ")}.`,
		"",
		"Alimentos que pode usar (código = nome · macro principal):",
		...candidates.map(
			(c) => `${c.code} = ${c.food.name} · ${ROLE_NAMES[mainMacro(c.food)]}`,
		),
		...(avoid.length > 0
			? ["", "Já sugeri:", ...avoid.map((entry) => `- ${entry}`)]
			: []),
	].join("\n");
}

import type { DietMeal, DietSummary } from "~/domains/diet/types/diet-types";
import { mealMacros, summaryProtein } from "~/domains/diet/utils/diet";
import type { CustomFoodSummary } from "~/domains/food/types/food-types";
import { kcalFor } from "~/domains/food/utils/food";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import {
	PROTEIN_LABELS,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import { formatNumber } from "~/shared/lib/format";

// --- Próxima refeição -------------------------------------------------------

/** "HH:MM" → minutos desde 00:00. */
export function toMinutes(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

/**
 * Próxima refeição com horário a partir de `nowMinutes`. Depois da última
 * do dia, volta pra primeira (amanhã). Null se nenhuma tem horário.
 */
export function findNextMeal(
	meals: DietMeal[],
	nowMinutes: number,
): { meal: DietMeal; tomorrow: boolean } | null {
	const timed = meals
		.filter((meal): meal is DietMeal & { time: string } => meal.time !== null)
		.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
	if (timed.length === 0) return null;

	const upcoming = timed.find((meal) => toMinutes(meal.time) >= nowMinutes);
	return upcoming
		? { meal: upcoming, tomorrow: false }
		: { meal: timed[0], tomorrow: true };
}

// --- Plano × meta -------------------------------------------------------------

/** Diferenças até ±5% (kcal) / ±10% (macros) contam como "fecha com a meta". */
const KCAL_TOLERANCE = 0.05;
const MACRO_TOLERANCE = 0.1;

export interface PlanVerdict {
	status: "empty" | "on-target" | "below" | "above";
	message: string;
}

export function planVerdict(
	summary: DietSummary,
	targets: GoalTargets,
	counting: ProteinCounting,
): PlanVerdict {
	if (summary.kcal === 0) {
		return {
			status: "empty",
			message: "Monte suas refeições na aba Dieta para comparar com a meta.",
		};
	}

	const macros = [
		{
			label: PROTEIN_LABELS[counting].lower,
			diff: summaryProtein(summary, counting) - targets.protein.grams,
			target: targets.protein.grams,
			kcalPerGram: 4,
		},
		{
			label: "carboidrato",
			diff: summary.lines.carbs.grams - targets.carbs.grams,
			target: targets.carbs.grams,
			kcalPerGram: 4,
		},
		{
			label: "gordura",
			diff: summary.lines.fat.grams - targets.fat.grams,
			target: targets.fat.grams,
			kcalPerGram: 9,
		},
	];
	const kcalDiff = summary.kcal - targets.calories;
	const macrosOk = macros.every(
		(m) => m.target <= 0 || Math.abs(m.diff) <= m.target * MACRO_TOLERANCE,
	);

	if (Math.abs(kcalDiff) <= targets.calories * KCAL_TOLERANCE && macrosOk) {
		return { status: "on-target", message: "Seu plano fecha com a meta." };
	}

	// O macro mais distante (em kcal) explica a diferença.
	const biggest = [...macros].sort(
		(a, b) =>
			Math.abs(b.diff) * b.kcalPerGram - Math.abs(a.diff) * a.kcalPerGram,
	)[0];
	const gram = `${biggest.diff > 0 ? "+" : "−"}${formatNumber(Math.abs(biggest.diff))} g`;
	const reason = `principalmente ${biggest.label} (${gram})`;

	if (kcalDiff < 0) {
		return {
			status: "below",
			message: `Faltam ${formatNumber(-kcalDiff)} kcal para a meta, ${reason}.`,
		};
	}
	return {
		status: "above",
		message: `Seu plano passa ${formatNumber(kcalDiff)} kcal da meta, ${reason}.`,
	};
}

// --- Pontos de atenção -------------------------------------------------------

export interface AttentionItem {
	id: string;
	message: string;
	href: "/tmb" | "/meta" | "/dieta" | "/alimentos";
	action: string;
}

/** Palavras que indicam proteína em pó (deveria ter muita proteína por 100 g). */
const PROTEIN_POWDER = /whey|proteina em po|protein|albumina|caseina/;

/** Sinais de cadastro errado em alimentos do usuário (por 100 g/ml). */
export function suspiciousFoods(foods: CustomFoodSummary[]): AttentionItem[] {
	const items: AttentionItem[] = [];
	for (const food of foods) {
		if (food.unit === "unit") continue;
		const total = food.protein + food.carbs + food.fat;
		const name = food.name
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "")
			.toLowerCase();

		if (total > 100) {
			items.push({
				id: `food-impossible-${food.id}`,
				message: `${food.name} tem mais de 100 g de macros em 100 g. Confira se os valores do rótulo são por 100 g.`,
				href: "/alimentos",
				action: "Revisar alimento",
			});
		} else if (PROTEIN_POWDER.test(name) && food.protein < 50) {
			items.push({
				id: `food-powder-${food.id}`,
				message: `${food.name} está com ${formatNumber(food.protein)} g de proteína por 100 g. Isso parece ser o valor de uma dose: proteína em pó costuma ter 70 a 85 g por 100 g.`,
				href: "/alimentos",
				action: "Revisar alimento",
			});
		}
	}
	return items;
}

export function emptyMealItems(meals: DietMeal[]): AttentionItem[] {
	const hasFood = meals.some((meal) => meal.items.length > 0);
	if (!hasFood) return [];
	return meals
		.filter((meal) => meal.items.length === 0)
		.map((meal) => ({
			id: `meal-empty-${meal.id}`,
			message: `${meal.name} está vazia.`,
			href: "/dieta" as const,
			action: "Abrir dieta",
		}));
}

/** kcal da refeição (atalho pra exibição). */
export function mealKcal(meal: DietMeal) {
	return kcalFor(mealMacros(meal));
}

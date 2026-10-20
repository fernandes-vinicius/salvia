import type { ResolvedTemplateMeal } from "~/domains/diet-templates/types/diet-template-types";
import type { Food } from "~/domains/food/types/food-types";
import { macrosFor, quantityRangeFor } from "~/domains/food/utils/food";
import {
	countedProtein,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";

/** Metas do dia em gramas (proteína contada como na Meta). */
export interface MacroGoal {
	protein: number;
	carbs: number;
	fat: number;
}

type Group = "protein" | "carbs" | "fat";
const GROUPS: Group[] = ["protein", "carbs", "fat"];
type Vector = [protein: number, carbs: number, fat: number];

/** Macros que contam pra meta: proteína (total ou animal), carbo e gordura. */
function goalMacros(
	food: Food,
	quantity: number,
	counting: ProteinCounting,
): Vector {
	const m = macrosFor(food, quantity);
	return [countedProtein(m, counting), m.carbs, m.fat];
}

/**
 * Macro que define o papel do alimento na dieta (o que mais pesa nas kcal).
 * Sem macros (ex.: folhas), o alimento não é escalado.
 */
function groupOf(food: Food, quantity: number): Group | null {
	// O papel do alimento não depende da preferência: o feijão é carbo nos
	// dois jeitos de contar.
	const [protein, carbs, fat] = goalMacros(food, quantity, "total");
	const kcal: Record<Group, number> = {
		protein: protein * 4,
		carbs: carbs * 4,
		fat: fat * 9,
	};
	const best = GROUPS.reduce((a, b) => (kcal[b] > kcal[a] ? b : a));
	return kcal[best] > 0 ? best : null;
}

function det3(m: number[][]) {
	return (
		m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
		m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
		m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
	);
}

/** Resolve `cols · s = target` (3×3, Cramer). Null se não tiver solução útil. */
function solve(cols: Vector[], target: Vector): Vector | null {
	const matrix = [0, 1, 2].map((row) => cols.map((col) => col[row]));
	const d = det3(matrix);
	if (Math.abs(d) < 1e-6) return null;
	const s = [0, 1, 2].map((i) => {
		const replaced = matrix.map((row, r) =>
			row.map((value, c) => (c === i ? target[r] : value)),
		);
		return det3(replaced) / d;
	}) as Vector;
	return s.every((value) => Number.isFinite(value) && value > 0) ? s : null;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

function roundQuantity(food: Food, quantity: number) {
	const { min, max, step } = quantityRangeFor(food.unit);
	const rounded = Math.round(quantity / step) * step;
	return Math.min(max, Math.max(min, rounded));
}

/**
 * Ajusta as quantidades do modelo às metas da pessoa. Cada alimento entra no
 * grupo do seu macro principal (proteína, carbo ou gordura) e cada grupo
 * ganha um fator de escala, calculado pra que o dia bata as três metas ao
 * mesmo tempo (o frango também tem gordura, o arroz um pouco de proteína…).
 * Sem metas, devolve o modelo como está.
 */
export function personalizeTemplate(
	meals: ResolvedTemplateMeal[],
	goal: MacroGoal | null,
	counting: ProteinCounting,
): ResolvedTemplateMeal[] {
	if (!goal) return meals;

	const totals: Record<Group, Vector> = {
		protein: [0, 0, 0],
		carbs: [0, 0, 0],
		fat: [0, 0, 0],
	};
	const fixed: Vector = [0, 0, 0];
	for (const meal of meals) {
		for (const { food, quantity } of meal.items) {
			const macros = goalMacros(food, quantity, counting);
			const group = groupOf(food, quantity);
			const bucket = group ? totals[group] : fixed;
			for (const i of [0, 1, 2]) bucket[i] += macros[i];
		}
	}

	const target: Vector = [
		goal.protein - fixed[0],
		goal.carbs - fixed[1],
		goal.fat - fixed[2],
	];
	const cols = GROUPS.map((group) => totals[group]);
	// Sem solução conjunta (ex.: falta um grupo), escala cada grupo só pelo
	// próprio macro.
	const scales =
		solve(cols, target) ??
		(GROUPS.map((group, i) =>
			totals[group][i] > 0 ? target[i] / totals[group][i] : 1,
		) as Vector);
	const scaleOf = (group: Group) =>
		Math.min(MAX_SCALE, Math.max(MIN_SCALE, scales[GROUPS.indexOf(group)]));

	return meals.map((meal) => ({
		...meal,
		items: meal.items.map(({ food, quantity }) => {
			const group = groupOf(food, quantity);
			return {
				food,
				quantity: group
					? roundQuantity(food, quantity * scaleOf(group))
					: quantity,
			};
		}),
	}));
}

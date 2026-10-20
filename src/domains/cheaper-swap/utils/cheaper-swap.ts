import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import { kcalFor, macrosFor, UNIT_LABELS } from "~/domains/food/utils/food";
import {
	type SwapItem,
	swapCandidates,
	swapQuantity,
} from "~/domains/meal-recipe/utils/recipe-swap";
import { PURCHASE_RULES } from "~/domains/shopping/data/purchase-rules";
import type { Price } from "~/domains/shopping/data/reference-prices";
import { swapCost } from "~/domains/shopping/utils/prices";
import { formatNumber } from "~/shared/lib/format";

// Troca mais em conta: ao abrir um alimento da dieta, um equivalente (mesmos
// macros, pela mesma regra das trocas da receita) que sai mais barato pelo
// preço da pessoa ou o de referência. A IA só escolhe entre as opções daqui.

/** Economia mínima pra sugerir (R$ por dia, ≈ R$ 3 por mês). */
export const MIN_SAVING = 0.1;

/**
 * Porção com menos kcal que isso não ganha sugestão: verdura e tempero têm
 * tão pouco macro que "equivalente" vira qualquer coisa (alface → cuscuz).
 */
export const MIN_SWAP_KCAL = 40;

/** Quantas opções vão pra IA escolher. */
export const MAX_CHEAPER_OPTIONS = 5;

export interface CheaperSwap {
	food: Food;
	quantity: number;
	/** Custo por dia (R$) do que sai e do que entra. */
	before: number;
	after: number;
	/** Quanto economiza por dia (R$, positivo). */
	saving: number;
}

type Portion = Pick<SwapItem, "food" | "quantity">;

/** O que se compra no mercado (ovo cru e cozido são os mesmos ovos). */
const purchaseName = (food: Food) =>
	(food.source === "taco" ? PURCHASE_RULES[food.name]?.name : undefined) ??
	food.name;

/**
 * O `food` no lugar do item, na quantidade equivalente, se sair pelo menos
 * `MIN_SAVING` mais barato. Null sem equivalência ou sem preço.
 */
export function cheaperSwap(
	item: Portion,
	food: Food,
	prices: ReadonlyMap<string, Price>,
): CheaperSwap | null {
	if (purchaseName(food) === purchaseName(item.food)) return null;
	const quantity = swapQuantity(item, food);
	if (quantity === null) return null;
	const cost = swapCost(item, { food, quantity }, prices);
	if (!cost || -cost.delta < MIN_SAVING) return null;
	return {
		food,
		quantity,
		before: cost.before,
		after: cost.after,
		saving: -cost.delta,
	};
}

/**
 * As trocas equivalentes mais baratas pro item, do mesmo tipo de alimento
 * (fruta por fruta, carne por peixe ou ovo; outra variedade vale), da que
 * economiza mais pra menos.
 */
export function cheaperSwaps(
	item: SwapItem,
	foods: Food[],
	prices: ReadonlyMap<string, Price>,
	{ light = false }: { light?: boolean } = {},
): CheaperSwap[] {
	if (kcalFor(macrosFor(item.food, item.quantity)) < MIN_SWAP_KCAL) return [];
	return swapCandidates(item, foods, {
		sameGroup: true,
		variants: true,
		light,
		limit: Number.POSITIVE_INFINITY,
	})
		.flatMap(({ food }) => cheaperSwap(item, food, prices) ?? [])
		.sort((a, b) => b.saving - a.saving)
		.slice(0, MAX_CHEAPER_OPTIONS);
}

/** Economia por mês, em reais redondos. */
export const monthlySaving = (savingPerDay: number) =>
	Math.round(savingPerDay * 30);

const portionText = ({ food, quantity }: Portion) =>
	`${formatNumber(quantity, 1)} ${UNIT_LABELS[food.unit].short} de ${food.name}`;

/** A refeição e as opções (S1, S2…) como vão pro prompt. */
export function cheaperSwapPrompt(
	meal: Pick<DietMeal, "name" | "time">,
	item: Portion,
	others: Portion[],
	options: CheaperSwap[],
) {
	return [
		`Refeição: ${meal.name}${meal.time ? ` (${meal.time})` : ""}`,
		others.length > 0
			? `Continua na refeição: ${others.map(portionText).join("; ")}`
			: "Continua na refeição: nada",
		`Trocar: ${portionText(item)}`,
		"Opções (mesmos macros, mais baratas):",
		...options.map(
			(option, index) =>
				`S${index + 1} = ${portionText(option)} (economiza ≈ R$ ${monthlySaving(option.saving)} por mês)`,
		),
	].join("\n");
}

/** A opção do código que a IA devolveu; inventado = a que economiza mais. */
export function pickCheaperSwap(options: CheaperSwap[], code: string) {
	const index = Number(/^S(\d+)$/.exec(code.trim())?.[1]) - 1;
	return options[index] ?? options[0] ?? null;
}

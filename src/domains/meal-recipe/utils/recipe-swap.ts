import { equivalentQuantity } from "~/domains/diet/utils/diet";
import type { Food, Macros } from "~/domains/food/types/food-types";
import {
	kcalFor,
	macrosFor,
	normalizeSearchText,
} from "~/domains/food/utils/food";
import {
	MAIN_DISH_FOODS,
	SWAP_FOODS,
} from "~/domains/meal-recipe/data/swap-foods";

// Trocas da receita: a IA pode trocar um alimento da refeição por outro
// equivalente (200 g de mamão → 90 g de banana), mas só entre as opções que
// o servidor calculou aqui, com os macros quase iguais.

export interface SwapItem {
	id: string;
	food: Food;
	quantity: number;
}

export interface RecipeSwap {
	itemId: string;
	food: Food;
	quantity: number;
}

/** Item da receita depois das trocas (`replaces`: o que estava na dieta). */
export interface SwappedItem {
	food: Food;
	quantity: number;
	replaces?: { food: Food; quantity: number };
}

/** Maior porção aceita numa troca (g ou ml). */
const MAX_SWAP_PORTION = 500;

/** Até quantas trocas uma receita pode ter. */
export const MAX_RECIPE_SWAPS = 2;

// Categorias da TACO que trocam bem entre si na cozinha (arroz ↔ batata,
// frango ↔ peixe). Alimento próprio não tem categoria: fica sem troca.
const SWAP_GROUPS = [
	["Frutas e derivados"],
	[
		"Cereais e derivados",
		"Verduras, hortaliças e derivados",
		"Leguminosas e derivados",
	],
	["Carnes e derivados", "Pescados e frutos do mar", "Ovos e derivados"],
	["Leite e derivados"],
];

// Alimentos que a TACO põe em "Alimentos preparados" mas que na cozinha são
// do grupo de outra categoria (cuscuz troca com arroz, pão e batata).
const CATEGORY_OVERRIDES: Record<string, string> = {
	"Cuscuz, de milho, cozido com sal": "Cereais e derivados",
};

/** Categoria usada nas trocas (a da TACO ou a corrigida acima). */
export const swapCategoryOf = (food: Pick<Food, "name" | "category">) =>
	CATEGORY_OVERRIDES[food.name] ?? food.category;

export function swapCategories(category: string | null): string[] {
	if (!category) return [];
	return SWAP_GROUPS.find((group) => group.includes(category)) ?? [];
}

const MACRO_KEYS: (keyof Macros)[] = [
	"proteinAnimal",
	"proteinVegetal",
	"carbs",
	"fat",
];

/** Diferença aceitável: o maior entre um mínimo fixo e uma fração do valor. */
const close = (before: number, after: number, floor: number, share: number) =>
	Math.abs(before - after) <= Math.max(floor, before * share);

/**
 * Quanto os macros podem mudar: `strict` (receita e variar refeição, "quase
 * os mesmos macros": ±10% kcal, ±3 g ou 15% por macro) ou `loose` (troca mais
 * em conta, "macros parecidos": ±20% kcal, ±5 g ou 30% por macro; senão
 * arroz ou cuscuz no lugar de pão nunca passam, por 20 kcal).
 */
export type SwapTolerance = "strict" | "loose";

const TOLERANCES: Record<
	SwapTolerance,
	{ kcal: [number, number]; macro: [number, number] }
> = {
	strict: { kcal: [15, 0.1], macro: [3, 0.15] },
	loose: { kcal: [25, 0.2], macro: [5, 0.3] },
};

/**
 * Quantidade do `food` que substitui o item mantendo o macro principal
 * (`equivalentQuantity`), ou null se os outros macros/kcal mudam demais.
 */
export function swapQuantity(
	item: Pick<SwapItem, "food" | "quantity">,
	food: Food,
	tolerance: SwapTolerance = "strict",
): number | null {
	if (food.id === item.food.id) return null;
	const equivalent = equivalentQuantity(item, food);
	if (!equivalent) return null;
	const { quantity } = equivalent;
	// Porção que ninguém come (1 kg de alface no lugar do arroz). Proporção
	// grande sozinha não basta pra recusar: 20 g de leite em pó = 180 ml.
	if (food.unit !== "unit" && quantity > MAX_SWAP_PORTION) return null;
	const before = macrosFor(item.food, item.quantity);
	const after = macrosFor(food, quantity);
	const { kcal, macro } = TOLERANCES[tolerance];
	if (!close(kcalFor(before), kcalFor(after), ...kcal)) return null;
	return MACRO_KEYS.every((key) => close(before[key], after[key], ...macro))
		? quantity
		: null;
}

const nameWords = (name: string) =>
	normalizeSearchText(name)
		.split(/[^a-z0-9]+/)
		.filter(Boolean);

const SWAP_FOOD_NAMES = new Set(SWAP_FOODS.map(normalizeSearchText));
const MAIN_DISH_NAMES = new Set(MAIN_DISH_FOODS.map(normalizeSearchText));

/**
 * Café, lanche ou ceia: pelo nome ou, com nome livre ("Refeição 2"), pelo
 * horário (antes das 11h, das 15h às 18h ou depois das 21h).
 */
export function isLightMeal(meal: { name: string; time: string | null }) {
	const name = normalizeSearchText(meal.name);
	if (/caf|lanche|ceia|desjejum/.test(name)) return true;
	if (/almoco|jantar/.test(name)) return false;
	if (!meal.time) return false;
	const hour = Number(meal.time.slice(0, 2));
	return hour < 11 || (hour >= 15 && hour < 18) || hour >= 21;
}
const RAW = ["cru", "crua"];
/** "Cru" na TACO, mas é assim que se come (não é carne crua). */
const EATEN_RAW = new Set(
	["Aveia, flocos, crua", "Castanha-do-Brasil, crua"].map(normalizeSearchText),
);
const FRUITS = "Frutas e derivados";

const distance = (a: Macros, b: Macros) =>
	MACRO_KEYS.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0);

export interface SwapCandidateOptions {
	/** Quantas opções no máximo. */
	limit?: number;
	/**
	 * Só do mesmo grupo de categorias e de outro tipo de alimento (receita).
	 * Sem ele (variar refeição), vale qualquer alimento com os macros
	 * equivalentes (arroz → banana, leite em pó → leite).
	 */
	sameGroup?: boolean;
	/** Café, lanche ou ceia (`isLightMeal`): sem comida de prato. */
	light?: boolean;
	/**
	 * Com `sameGroup`, aceita outra variedade do mesmo alimento (mamão
	 * papaia → formosa): na troca mais em conta, é a troca mais natural.
	 */
	variants?: boolean;
	/** Só a melhor de cada tipo de alimento (padrão: sim). */
	onePerKind?: boolean;
	tolerance?: SwapTolerance;
}

/**
 * As trocas mais parecidas pro item, entre `foods`: alimentos comuns
 * (`SWAP_FOODS`) ou da própria pessoa, sem cru no lugar de pronto e uma por
 * tipo de alimento (só a melhor banana, não cinco).
 */
export function swapCandidates(
	item: SwapItem,
	foods: Food[],
	{
		limit = 6,
		sameGroup = true,
		light = false,
		variants = false,
		onePerKind = true,
		tolerance = "strict",
	}: SwapCandidateOptions = {},
): { food: Food; quantity: number }[] {
	const categories = swapCategories(swapCategoryOf(item.food));
	const own = nameWords(item.food.name);
	const ownIsRaw = own.some((word) => RAW.includes(word));
	const before = macrosFor(item.food, item.quantity);

	const scored = foods.flatMap((food) => {
		const category = swapCategoryOf(food);
		if (sameGroup && !(category && categories.includes(category))) {
			return [];
		}
		const normalized = normalizeSearchText(food.name);
		if (light && MAIN_DISH_NAMES.has(normalized)) return [];
		const common = SWAP_FOOD_NAMES.has(normalized);
		if (food.source !== "custom" && !common) return [];
		const words = nameWords(food.name);
		// Na receita, trocar mamão formosa por papaia não acrescenta nada; ao
		// variar a refeição, leite em pó → leite é uma troca de verdade.
		if (sameGroup && !variants && words[0] === own[0]) return [];
		// Cru no lugar de pronto (frango cru, mandioca crua), menos fruta.
		const raw =
			!EATEN_RAW.has(normalized) && words.some((word) => RAW.includes(word));
		if (raw && !ownIsRaw && food.category !== FRUITS) return [];
		const quantity = swapQuantity(item, food, tolerance);
		if (quantity === null) return [];
		return [
			{
				food,
				quantity,
				head: words[0],
				score: distance(before, macrosFor(food, quantity)),
			},
		];
	});

	scored.sort(
		(a, b) => a.score - b.score || a.food.name.length - b.food.name.length,
	);
	const heads = new Set<string>();
	return scored
		.filter(({ head }) => !onePerKind || (!heads.has(head) && heads.add(head)))
		.slice(0, limit)
		.map(({ food, quantity }) => ({ food, quantity }));
}

/** Os itens da refeição com as trocas aplicadas, na mesma ordem. */
export function applySwaps(
	items: SwapItem[],
	swaps: RecipeSwap[],
): SwappedItem[] {
	return items.map(({ id, food, quantity }) => {
		const swap = swaps.find((entry) => entry.itemId === id);
		return swap
			? {
					food: swap.food,
					quantity: swap.quantity,
					replaces: { food, quantity },
				}
			: { food, quantity };
	});
}

/**
 * As trocas que a IA escolheu (códigos T1, T2…), na ordem dela: código
 * inventado é ignorado e cada item troca no máximo uma vez.
 */
export function swapsFromCodes(
	items: (Pick<SwapItem, "id"> & {
		swaps: { code: string; food: Food; quantity: number }[];
	})[],
	codes: string[],
	max = Number.POSITIVE_INFINITY,
): RecipeSwap[] {
	const swaps: RecipeSwap[] = [];
	for (const code of codes) {
		const item = items.find((entry) =>
			entry.swaps.some((option) => option.code === code),
		);
		const option = item?.swaps.find((entry) => entry.code === code);
		if (!item || !option || swaps.some((swap) => swap.itemId === item.id)) {
			continue;
		}
		swaps.push({
			itemId: item.id,
			food: option.food,
			quantity: option.quantity,
		});
		if (swaps.length >= max) break;
	}
	return swaps;
}

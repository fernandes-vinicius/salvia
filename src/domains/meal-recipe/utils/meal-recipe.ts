import type { Food } from "~/domains/food/types/food-types";
import { normalizeSearchText, UNIT_LABELS } from "~/domains/food/utils/food";
import { householdHint } from "~/domains/food/utils/household";
import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import { formatNumber } from "~/shared/lib/format";

// Regras puras da receita da refeição (sugerida pela IA com só o que a
// refeição já tem).

type Portion = { food: Pick<Food, "name" | "unit">; quantity: number };

export interface RecipeItem extends Portion {
	/** Troca da receita: o que estava na dieta. */
	replaces?: Portion;
}

/** Troca possível oferecida à IA, com o código que ela devolve. */
export interface PromptSwap extends Portion {
	code: string;
}

const amountOf = ({ food, quantity }: Portion) =>
	`${formatNumber(quantity, 1)} ${UNIT_LABELS[food.unit].short}`;

// Com a medida caseira, a IA escreve "2 ovos" nos passos em vez de "100 g".
const portionLine = (portion: Portion) => {
	const hint = householdHint(portion.food, portion.quantity);
	return `${portion.food.name} — ${amountOf(portion)}${hint ? ` (${hint.long})` : ""}`;
};

/**
 * A refeição como vai pro prompt: "- Banana, prata, crua — 100 g", com as
 * trocas possíveis embaixo ("pode trocar por: T1 = …").
 */
export function mealPrompt(items: (RecipeItem & { swaps?: PromptSwap[] })[]) {
	return items
		.flatMap((item) => [
			`- ${portionLine(item)}`,
			...(item.swaps?.length
				? [
						`  pode trocar por: ${item.swaps
							.map((swap) => `${swap.code} = ${portionLine(swap)}`)
							.join("; ")}`,
					]
				: []),
		])
		.join("\n");
}

// Rede de segurança no servidor: mesmo com o prompt proibindo, um extra com
// caloria relevante não chega na tela (a não ser que já esteja na refeição).
const CALORIC_WORDS = [
	"oleo",
	"azeite",
	"manteiga",
	"margarina",
	"banha",
	"bacon",
	"linguica",
	"acucar",
	"mel",
	"melado",
	"xarope",
	"rapadura",
	"leite",
	"creme",
	"nata",
	"queijo",
	"requeijao",
	"iogurte",
	"whey",
	"farinha",
	"farelo",
	"aveia",
	"granola",
	"pao",
	"torrada",
	"chocolate",
	"castanha",
	"amendoim",
	"amendoa",
	"nozes",
	"coco",
	"maionese",
	"ketchup",
	"molho",
	"fruta",
];

const words = (text: string) => normalizeSearchText(text).split(/[^a-z0-9]+/);

export function safeExtras<T extends { name: string }>(
	extras: T[],
	items: RecipeItem[],
): T[] {
	const inMeal = new Set(items.flatMap((item) => words(item.food.name)));
	const seen = new Set<string>();
	return extras.filter((extra) => {
		const key = normalizeSearchText(extra.name);
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return !words(extra.name).some(
			(word) => CALORIC_WORDS.includes(word) && !inMeal.has(word),
		);
	});
}

/** Texto pra copiar/compartilhar (negrito do WhatsApp no título). */
export function recipeText(recipe: MealRecipe, items: RecipeItem[]) {
	return [
		`*${recipe.title}* (${formatNumber(recipe.minutes)} min)`,
		recipe.summary,
		"",
		"Ingredientes:",
		...items.map(
			(item) =>
				`- ${amountOf(item)} de ${item.food.name}${
					item.replaces
						? ` (no lugar de ${amountOf(item.replaces)} de ${item.replaces.food.name})`
						: ""
				}`,
		),
		...recipe.extras.map((extra) => `- ${extra.name}: ${extra.amount}`),
		"",
		"Modo de preparo:",
		...recipe.steps.map((step, index) => `${index + 1}. ${step}`),
		...(recipe.tip ? ["", `Dica: ${recipe.tip}`] : []),
	].join("\n");
}

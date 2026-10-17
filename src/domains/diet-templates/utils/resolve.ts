import { TEMPLATE_CUSTOM_FOODS } from "~/domains/diet-templates/data/templates";
import type {
	DietTemplate,
	ResolvedTemplateMeal,
} from "~/domains/diet-templates/types/diet-template-types";
import type { Food } from "~/domains/food/types/food-types";

/** Prefixo do id de um alimento próprio que o modelo ainda vai criar. */
export const PENDING_CUSTOM_PREFIX = "template:";

export interface TemplateFoods {
	/** Alimentos da TACO por `taco_id`. */
	taco: Map<number, Food>;
	/** Alimentos próprios do usuário por chave do modelo (ex.: "whey"). */
	custom: Map<string, Food>;
}

/**
 * Troca as referências do modelo pelos alimentos de verdade. Alimento próprio
 * que o usuário ainda não tem vira um "pendente" (id `template:<chave>`),
 * criado ao aplicar. Itens sem alimento na base são ignorados.
 */
export function resolveTemplate(
	template: DietTemplate,
	foods: TemplateFoods,
): ResolvedTemplateMeal[] {
	return template.meals.map((meal) => ({
		name: meal.name,
		time: meal.time,
		items: meal.items.flatMap((item) => {
			const food =
				"taco" in item
					? foods.taco.get(item.taco)
					: (foods.custom.get(item.custom) ?? pendingCustom(item.custom));
			return food ? [{ food, quantity: item.quantity }] : [];
		}),
	}));
}

function pendingCustom(key: string): Food | undefined {
	const values = TEMPLATE_CUSTOM_FOODS[key];
	if (!values) return undefined;
	return {
		id: `${PENDING_CUSTOM_PREFIX}${key}`,
		source: "custom",
		category: null,
		...values,
	};
}

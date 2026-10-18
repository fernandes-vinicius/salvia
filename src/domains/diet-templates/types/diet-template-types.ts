import type { Food } from "~/domains/food/types/food-types";

/** Alimento do modelo: da TACO (pelo id da tabela) ou cadastrado pelo usuário. */
export type TemplateFoodRef =
	| { taco: number }
	/** Chave de `TEMPLATE_CUSTOM_FOODS`; reaproveita um alimento do usuário com o mesmo nome. */
	| { custom: string };

export type TemplateItem = TemplateFoodRef & {
	/** Quantidade de referência (g/ml ou unidades), antes de personalizar. */
	quantity: number;
};

export interface TemplateMeal {
	name: string;
	/** "HH:MM" ou nulo. */
	time: string | null;
	items: TemplateItem[];
}

export interface DietTemplate {
	id: string;
	name: string;
	/** Rótulo curto do objetivo, ex.: "Perder peso". */
	tag: string;
	description: string;
	meals: TemplateMeal[];
}

/** Valores de um alimento próprio que o modelo cria se o usuário não tiver. */
export type TemplateCustomFood = Pick<
	Food,
	"name" | "unit" | "protein" | "carbs" | "fat" | "fiber" | "proteinSource"
>;

/** Modelo com os alimentos resolvidos e as quantidades já personalizadas. */
export interface ResolvedTemplateMeal {
	name: string;
	time: string | null;
	items: { food: Food; quantity: number }[];
}

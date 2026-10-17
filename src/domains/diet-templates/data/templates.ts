import type {
	DietTemplate,
	TemplateCustomFood,
} from "~/domains/diet-templates/types/diet-template-types";

// Dietas prontas do dashboard. Alimentos da TACO pelo `taco` (id da tabela,
// igual em qualquer banco); os de rótulo vêm de `TEMPLATE_CUSTOM_FOODS`.
// As quantidades são a referência: ao aplicar, são escaladas pras metas da
// pessoa (ver `personalizeTemplate`). Pra criar outro modelo (barata,
// bulking…), é só adicionar à lista.

export const TEMPLATE_CUSTOM_FOODS: Record<string, TemplateCustomFood> = {
	whey: {
		name: "Whey protein",
		unit: "g",
		protein: 80,
		carbs: 7,
		fat: 4,
		proteinSource: "animal",
	},
};

const TACO = {
	ovo: 489, // Ovo, de galinha, inteiro, cru
	banana: 182, // Banana, prata, crua
	frangoCozido: 408, // Frango, peito, sem pele, cozido
	frangoGrelhado: 410, // Frango, peito, sem pele, grelhado
	arroz: 3, // Arroz, tipo 1, cozido
	azeite: 260, // Azeite, de oliva, extra virgem
	alface: 78, // Alface, crespa, crua
	tomate: 157, // Tomate, com semente, cru
	paoIntegral: 52, // Pão, trigo, forma, integral
	amendoim: 558, // Amendoim, torrado, salgado
	leitePo: 459, // Leite, de vaca, integral, pó
	aveia: 7, // Aveia, flocos, crua
} as const;

export const DIET_TEMPLATES: DietTemplate[] = [
	{
		id: "cutting-classico",
		name: "Cutting clássico",
		tag: "Cutting",
		description:
			"5 refeições com frango, arroz, ovos e whey. A dieta da planilha que deu origem ao app.",
		meals: [
			{
				name: "Café da manhã",
				time: "09:00",
				items: [
					{ taco: TACO.ovo, quantity: 200 },
					{ taco: TACO.banana, quantity: 75 },
				],
			},
			{
				name: "Almoço",
				time: "12:00",
				items: [
					{ taco: TACO.frangoCozido, quantity: 100 },
					{ taco: TACO.arroz, quantity: 100 },
					{ taco: TACO.azeite, quantity: 10 },
					{ taco: TACO.alface, quantity: 60 },
					{ taco: TACO.tomate, quantity: 40 },
				],
			},
			{
				name: "Lanche",
				time: "15:00",
				items: [
					{ taco: TACO.frangoCozido, quantity: 100 },
					{ taco: TACO.paoIntegral, quantity: 50 },
					{ taco: TACO.amendoim, quantity: 20 },
				],
			},
			{
				name: "Jantar",
				time: "18:00",
				items: [
					{ taco: TACO.frangoGrelhado, quantity: 100 },
					{ taco: TACO.arroz, quantity: 100 },
					{ taco: TACO.azeite, quantity: 10 },
					{ taco: TACO.alface, quantity: 60 },
					{ taco: TACO.tomate, quantity: 40 },
				],
			},
			{
				name: "Ceia",
				time: "21:00",
				items: [
					{ custom: "whey", quantity: 30 },
					{ taco: TACO.leitePo, quantity: 20 },
					{ taco: TACO.aveia, quantity: 40 },
				],
			},
		],
	},
];

export function findTemplate(id: string) {
	return DIET_TEMPLATES.find((template) => template.id === id) ?? null;
}

/** Todos os ids da TACO usados pelos modelos (pra buscar de uma vez). */
export const TEMPLATE_TACO_IDS = [
	...new Set(
		DIET_TEMPLATES.flatMap((template) =>
			template.meals.flatMap((meal) =>
				meal.items.flatMap((item) => ("taco" in item ? [item.taco] : [])),
			),
		),
	),
];

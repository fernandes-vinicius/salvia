import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Food } from "~/domains/food/types/food-types";
import { MealVariationView } from "~/domains/meal-variation/components/meal-variation-view";

// Variação mockada (a de verdade vem da IA pela Server Action, fora da story).
const food = (
	name: string,
	category: string | null,
	[protein, carbs, fat]: [number, number, number],
	extra: Partial<Food> = {},
): Food => ({
	id: name,
	source: "taco",
	name,
	category,
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource: "vegetal",
	...extra,
});

const whey = food("Whey protein", null, [83, 6.7, 3.3], {
	source: "custom",
	proteinSource: "animal",
});
const leitePo = food(
	"Leite, de vaca, integral, pó",
	"Leite e derivados",
	[25.4, 39.2, 26.9],
	{ proteinSource: "animal" },
);
const leite = food(
	"Leite, de vaca, integral",
	"Leite e derivados",
	[3, 4.5, 3],
	{
		proteinSource: "animal",
	},
);
const aveia = food(
	"Aveia, flocos, crua",
	"Cereais e derivados",
	[13.9, 66.6, 8.5],
);
const pao = food("Pão, aveia, forma", "Cereais e derivados", [12.4, 59.6, 5.7]);

const ceia = [
	{ id: "c1", food: whey, quantity: 30 },
	{ id: "c2", food: leitePo, quantity: 20 },
	{ id: "c3", food: aveia, quantity: 40 },
];

const meta = {
	title: "Dieta/Variar refeição",
	component: MealVariationView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Outra versão da refeição com os mesmos macros (beta, menu ⋮ da refeição → "Variar refeição"). O servidor calcula as trocas equivalentes (`swapCandidates`) e a IA só escolhe uma combinação que combine; nada muda na dieta até "Usar esta".',
			},
		},
	},
	args: {
		items: ceia,
		variation: {
			title: "Ceia de pão de aveia com leite",
			summary:
				"Torrada de pão de aveia com um copo de leite batido com o whey.",
			swaps: [
				{ itemId: "c2", food: leite, quantity: 180 },
				{ itemId: "c3", food: pao, quantity: 45 },
			],
		},
	},
	render: (args) => (
		<div className="max-w-md">
			<MealVariationView {...args} />
		</div>
	),
} satisfies Meta<typeof MealVariationView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variacao: Story = { name: "Variação" };

export const UmaTroca: Story = {
	name: "Só uma troca",
	args: {
		variation: {
			title: "Ceia com pão de aveia",
			summary: "Pão de aveia tostado e o shake de whey com leite.",
			swaps: [{ itemId: "c3", food: pao, quantity: 45 }],
		},
	},
};

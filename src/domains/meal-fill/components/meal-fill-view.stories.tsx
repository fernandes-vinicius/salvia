import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Food } from "~/domains/food/types/food-types";
import { MealFillView } from "~/domains/meal-fill/components/meal-fill-view";

// Sugestão mockada (a de verdade vem da IA pela Server Action, fora da story).
const food = (
	name: string,
	[protein, carbs, fat]: [number, number, number],
	extra: Partial<Food> = {},
): Food => ({
	id: name,
	source: "taco",
	name,
	category: null,
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource: "vegetal",
	...extra,
});

const meta = {
	title: "Dieta/Completar com IA",
	component: MealFillView,
	args: {
		fill: {
			title: "Peito de frango, arroz branco e azeite",
			summary:
				"Sirva o frango grelhado com o arroz e finalize com um fio de azeite.",
			items: [
				{
					food: food("Frango, peito, sem pele, grelhado", [32, 0, 2.5], {
						proteinSource: "animal",
					}),
					quantity: 100,
				},
				{
					food: food("Arroz, tipo 1, cozido", [2.5, 28.1, 0.2]),
					quantity: 105,
				},
				{
					food: food("Azeite, de oliva, extra virgem", [0, 0, 100]),
					quantity: 10,
				},
			],
			gap: { protein: 33, carbs: 30, fat: 14, kcal: 380 },
		},
	},
	render: (args) => (
		<div className="max-w-xl">
			<MealFillView {...args} />
		</div>
	),
} satisfies Meta<typeof MealFillView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Almoco: Story = {};

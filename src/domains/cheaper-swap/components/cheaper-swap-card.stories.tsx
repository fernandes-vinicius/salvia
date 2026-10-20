import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CheaperSwapCard } from "~/domains/cheaper-swap/components/cheaper-swap-card";
import type { Food } from "~/domains/food/types/food-types";

// Sugestão mockada (a de verdade vem da IA pela Server Action, fora da story).
// Custos pelo preço de referência: maçã R$ 12/kg, banana-nanica R$ 6/kg.
const food = (
	name: string,
	[protein, carbs, fat]: [number, number, number],
): Food => ({
	id: name,
	source: "taco",
	name,
	category: "Frutas e derivados",
	unit: "g",
	protein,
	carbs,
	fat,
	fiber: 0,
	proteinSource: "vegetal",
});

const maca = food("Maçã, Fuji, com casca, crua", [0.3, 15.2, 0]);
const nanica = food("Banana, nanica, crua", [1.4, 23.8, 0.1]);

const meta = {
	title: "Dieta/Troca mais em conta",
	component: CheaperSwapCard,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
	args: {
		item: { food: maca, quantity: 155 },
		food: nanica,
		insight:
			"Banana combina com o iogurte do lanche e rende o mesmo carboidrato.",
		onReplace: async () => true,
	},
} satisfies Meta<typeof CheaperSwapCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComFrase: Story = {};

/** A IA não respondeu (limite do dia, erro): a troca aparece sem a frase. */
export const SemFrase: Story = { args: { insight: null } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DraftBar } from "~/domains/diet/components/draft-bar";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { diffDraft } from "~/domains/diet/utils/diet-draft";
import { SAMPLE_MEALS } from "~/domains/landing/utils/sample-data";

// Draft = the sample day with the first item of the second meal bumped by 50%
// and the last item of the last meal removed.
const draft: DietMeal[] = SAMPLE_MEALS.map((meal, mealIndex) => ({
	...meal,
	id: `draft-${meal.id}`,
	sourceMealId: meal.id,
	items: meal.items
		.filter(
			(_, itemIndex) =>
				!(
					mealIndex === SAMPLE_MEALS.length - 1 &&
					itemIndex === meal.items.length - 1
				),
		)
		.map((item, itemIndex) => ({
			...item,
			id: `draft-${item.id}`,
			quantity:
				mealIndex === 1 && itemIndex === 0
					? item.quantity * 1.5
					: item.quantity,
		})),
}));

const wait = () =>
	new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));

const meta = {
	title: "Dieta/Rascunho",
	component: DraftBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Faixa do rascunho no topo da Dieta: avisa que nada muda até usar, mostra a diferença pra dieta atual e leva a "Descartar" e "Usar este rascunho" (com a lista do que muda e a opção de guardar a dieta de antes).',
			},
		},
	},
	args: {
		base: SAMPLE_MEALS,
		meals: draft,
		diff: diffDraft(SAMPLE_MEALS, draft),
		proteinCounting: "total",
		onApply: wait,
		onDiscard: wait,
	},
	decorators: [
		(Story) => (
			<div className="max-w-2xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DraftBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComMudancas: Story = { name: "Com mudanças" };

export const SemMudancas: Story = {
	name: "Recém-criado (sem mudanças)",
	args: {
		meals: SAMPLE_MEALS,
		diff: diffDraft(
			SAMPLE_MEALS,
			SAMPLE_MEALS.map((meal) => ({ ...meal, sourceMealId: meal.id })),
		),
	},
};

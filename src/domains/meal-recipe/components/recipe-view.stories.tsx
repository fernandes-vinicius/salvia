import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_MEALS } from "~/domains/landing/utils/sample-data";
import { RecipeView } from "~/domains/meal-recipe/components/recipe-view";
import { recipeSnapshot } from "~/domains/meal-recipe/utils/saved-recipe";

// Receita mockada (a de verdade vem da IA pela Server Action, fora da story).
const cafe = SAMPLE_MEALS[0];

const meta = {
	title: "Dieta/Receita da refeição",
	component: RecipeView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Receita sugerida pela IA com só os alimentos da refeição (beta, menu ⋮ da refeição → "Sugerir receita"). Ingredientes e macros vêm da dieta; da IA saem o preparo e os extras sem caloria (filtrados por `safeExtras`).',
			},
		},
	},
	args: {
		snapshot: recipeSnapshot(cafe.items),
		recipe: {
			title: "Omelete de forno com banana tostada",
			summary:
				"Omelete fofinha com pão crocante e banana caramelizada na frigideira.",
			minutes: 15,
			extras: [
				{ name: "Sal e orégano", amount: "a gosto" },
				{ name: "Tomate picado", amount: "1/2 unidade" },
				{ name: "Canela", amount: "1 pitada" },
			],
			steps: [
				"Bata os 3 ovos com sal, orégano e o tomate picado.",
				"Despeje numa forma pequena antiaderente e asse a 200 °C por 10 minutos.",
				"Toste o pão na frigideira antiaderente, sem gordura.",
				"Corte a banana ao meio e doure na mesma frigideira; finalize com canela.",
				"Sirva a omelete com o pão e a banana.",
			],
			tip: "Sem forno? Faça a omelete na frigideira tampada em fogo baixo.",
			photo: null,
		},
	},
} satisfies Meta<typeof RecipeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Receita: Story = {
	render: (args) => (
		<div className="max-w-md">
			<RecipeView {...args} />
		</div>
	),
};

export const SalvaComRefeicaoAlterada: Story = {
	name: "Salva, com a refeição alterada",
	render: (args) => (
		<div className="max-w-md">
			<RecipeView
				{...args}
				notice={
					<p className="rounded-2xl bg-muted px-3 py-2 text-muted-foreground text-xs">
						Sua refeição mudou desde que você salvou: confira as quantidades.
					</p>
				}
			/>
		</div>
	),
};

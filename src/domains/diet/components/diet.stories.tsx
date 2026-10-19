import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DietPreview } from "~/domains/diet/components/diet-preview";
import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import { GoalProgress } from "~/domains/diet/components/goal-progress";
import { MacroLine } from "~/domains/food/components/macro-line";
import { macrosFor } from "~/domains/food/utils/food";
import {
	arroz,
	SAMPLE_ENERGY,
	SAMPLE_MEALS,
	SAMPLE_SHOPPING,
	SAMPLE_SUMMARY,
	SAMPLE_TARGETS,
} from "~/domains/landing/utils/sample-data";
import { ShoppingGroups } from "~/domains/shopping/components/shopping-groups";

// Componentes de domínio com o dia de exemplo da landing (`SAMPLE_MEALS`),
// os mesmos números que aparecem nas telas da página inicial.
const meta = {
	title: "Dieta/Telas",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Peças da aba Dieta e da lista de compras, renderizadas com o dia de exemplo da landing. Macros em texto usam os tons `-ink`; proteína animal e vegetal ficam separadas.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LinhaDeMacros: Story = {
	name: "MacroLine",
	render: () => <MacroLine macros={macrosFor(arroz, 150)} />,
};

export const ResumoDoDia: Story = {
	name: "Resumo do dia",
	render: () => (
		<div className="max-w-sm">
			<DietSummaryCard summary={SAMPLE_SUMMARY} tdee={SAMPLE_ENERGY.tdee} />
		</div>
	),
};

export const PlanejadoXMeta: Story = {
	name: "Planejado × meta",
	render: () => (
		<div className="max-w-sm">
			<GoalProgress summary={SAMPLE_SUMMARY} targets={SAMPLE_TARGETS} />
		</div>
	),
};

export const Visualizar: Story = {
	name: "Visualizar (base do PDF)",
	render: () => (
		<div className="max-w-2xl">
			<DietPreview meals={SAMPLE_MEALS.slice(0, 2)} />
		</div>
	),
};

export const ListaDeCompras: Story = {
	name: "Lista de compras",
	render: () => (
		<ShoppingGroups
			groups={SAMPLE_SHOPPING}
			checked={new Set(["rule:Ovos"])}
			onToggle={() => {}}
		/>
	),
};

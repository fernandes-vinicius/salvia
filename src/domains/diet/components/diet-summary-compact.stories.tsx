import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { DietSummaryCompact } from "~/domains/diet/components/diet-summary-compact";
import {
	SAMPLE_SUMMARY,
	SAMPLE_TARGETS,
} from "~/domains/landing/utils/sample-data";

// Faixa do topo da Dieta no celular (o resumo completo abre embaixo).
const meta = {
	title: "Dieta/Resumo compacto",
	component: DietSummaryCompact,
	parameters: { viewport: { defaultViewport: "mobile1" } },
	args: {
		summary: SAMPLE_SUMMARY,
		targets: SAMPLE_TARGETS,
		proteinCounting: "total",
		expanded: false,
		onToggle: () => {},
	},
	render: (args) => {
		const [expanded, setExpanded] = useState(args.expanded);
		return (
			<div className="max-w-sm">
				<DietSummaryCompact
					{...args}
					expanded={expanded}
					onToggle={() => setExpanded((open) => !open)}
				/>
			</div>
		);
	},
} satisfies Meta<typeof DietSummaryCompact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComMeta: Story = {};
export const SemMeta: Story = { args: { targets: null } };
export const SoAnimal: Story = { args: { proteinCounting: "animal" } };

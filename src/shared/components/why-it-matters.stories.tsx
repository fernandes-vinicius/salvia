import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WhyItMatters } from "~/shared/components/why-it-matters";

// Dica recolhida ao lado das escolhas da TMB e da Meta.
const meta = {
	title: "App/Por que isso importa",
	component: WhyItMatters,
	args: {
		children: (
			<p>
				Perder de 0,5% a 1% do peso por semana ajuda a manter o músculo e a fome
				sob controle. Pra você, isso é de 0,4 a 0,8 kg por semana.
			</p>
		),
	},
	render: (args) => (
		<div className="max-w-md">
			<WhyItMatters {...args} />
		</div>
	),
} satisfies Meta<typeof WhyItMatters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ValeConferir: Story = { args: { attention: true } };

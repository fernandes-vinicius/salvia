import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "~/shared/components/ui/badge";

const meta = {
	title: "Componentes/Badge",
	component: Badge,
	tags: ["autodocs"],
	args: { children: "Animal", variant: "secondary" },
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"secondary",
				"outline",
				"ghost",
				"destructive",
				"link",
			],
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };

export const Variantes: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge>Novo</Badge>
			<Badge variant="secondary">Animal</Badge>
			<Badge variant="outline">Vegetal</Badge>
			<Badge variant="destructive">Furei</Badge>
		</div>
	),
};

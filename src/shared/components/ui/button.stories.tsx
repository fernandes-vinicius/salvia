import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Plus, Trash2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

const meta = {
	title: "Componentes/Button",
	component: Button,
	tags: ["autodocs"],
	args: { children: "Salvar", variant: "default", size: "default" },
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
		size: {
			control: "select",
			options: [
				"xs",
				"sm",
				"default",
				"lg",
				"icon-xs",
				"icon-sm",
				"icon",
				"icon-lg",
			],
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					'Botão em pílula (Base UI). `default` é a ação principal; `secondary`/`outline` as de apoio; `destructive` em tom suave (terracota). Ícone com `data-icon="inline-start"`. Como link: `nativeButton={false}` + `render={<Link href="…" />}`.',
			},
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

export const Variantes: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Button>Principal</Button>
			<Button variant="secondary">Secundário</Button>
			<Button variant="outline">Contorno</Button>
			<Button variant="ghost">Fantasma</Button>
			<Button variant="destructive">Excluir</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};

export const Tamanhos: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<Button size="xs">Extra pequeno</Button>
			<Button size="sm">Pequeno</Button>
			<Button>Padrão</Button>
			<Button size="lg">Grande</Button>
		</div>
	),
};

export const ComIcone: Story = {
	name: "Com ícone",
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<Button>
				<Plus data-icon="inline-start" />
				Adicionar alimento
			</Button>
			<Button variant="destructive">
				<Trash2 data-icon="inline-start" />
				Remover da refeição
			</Button>
			<Button size="icon" variant="outline" aria-label="Adicionar">
				<Plus />
			</Button>
		</div>
	),
};

export const Desabilitado: Story = { args: { disabled: true } };

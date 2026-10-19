import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "~/shared/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Switch } from "~/shared/components/ui/switch";
import { Textarea } from "~/shared/components/ui/textarea";

const meta = {
	title: "Componentes/Campos",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Campos de formulário (Base UI) com `Field` pra rótulo, descrição e erro. Nos formulários do app, a validação é Conform + Zod; valores técnicos nunca são digitados (use `ChoiceCard` ou `MeasureSlider`).",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CampoDeTexto: Story = {
	name: "Campo de texto",
	render: () => (
		<Field className="max-w-sm">
			<FieldLabel htmlFor="nome">Nome</FieldLabel>
			<Input id="nome" placeholder="Ex.: Whey protein baunilha" />
			<FieldDescription>Como vai aparecer na sua dieta.</FieldDescription>
		</Field>
	),
};

export const ComErro: Story = {
	name: "Com erro",
	render: () => (
		<Field className="max-w-sm">
			<FieldLabel htmlFor="nome-erro">Nome</FieldLabel>
			<Input id="nome-erro" aria-invalid defaultValue="A" />
			<FieldError errors={[{ message: "Dê um nome ao alimento." }]} />
		</Field>
	),
};

export const AreaDeTexto: Story = {
	name: "Área de texto",
	render: () => (
		<Field className="max-w-md">
			<FieldLabel htmlFor="mensagem">Mensagem</FieldLabel>
			<Textarea
				id="mensagem"
				placeholder="Ex.: queria ver quanto custa minha dieta por semana."
			/>
		</Field>
	),
};

export const CaixaEInterruptor: Story = {
	name: "Caixa de seleção e interruptor",
	render: () => (
		<div className="flex flex-col gap-4">
			<label className="flex items-center gap-2 text-sm">
				<Checkbox defaultChecked />
				Peito de frango sem pele
			</label>
			<div className="flex items-center gap-2">
				<Switch id="visualizar" />
				<Label htmlFor="visualizar">Visualizar</Label>
			</div>
		</div>
	),
};

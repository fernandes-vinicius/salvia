import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ChoiceCard } from "~/shared/components/choice-card";
import { FaqList } from "~/shared/components/faq-list";
import { FormSection } from "~/shared/components/form-section";
import {
	Dumbbell,
	Equal,
	Scale,
	TrendingDown,
	TrendingUp,
	Weight,
} from "~/shared/components/icons";
import { Logo } from "~/shared/components/logo";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { PageHeader } from "~/shared/components/page-header";
import { SaveStatus } from "~/shared/components/save-status";
import { SwitchCard } from "~/shared/components/switch-card";
import { RadioGroup } from "~/shared/components/ui/radio-group";

const meta = {
	title: "App/Componentes compartilhados",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Peças do Sálvia em `src/shared/components`. Regra de UX pra leigos: valores técnicos nunca são digitados — a pessoa escolhe uma opção descritiva (`ChoiceCard`) ou ajusta uma medida (`MeasureSlider`).",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CartaoDeEscolha: Story = {
	name: "ChoiceCard",
	render: function Render() {
		const [value, setValue] = useState("lose");
		return (
			<RadioGroup
				aria-label="Objetivo"
				value={value}
				onValueChange={(next) => setValue(next as string)}
				className="max-w-md gap-2"
			>
				<ChoiceCard
					value="lose"
					icon={TrendingDown}
					title="Perder peso"
					description="Comer um pouco menos do que você gasta"
					hint="−500 kcal"
				/>
				<ChoiceCard
					value="maintain"
					icon={Equal}
					title="Manter o peso"
					description="Comer o quanto você gasta"
				/>
				<ChoiceCard
					value="gain"
					icon={TrendingUp}
					title="Ganhar massa"
					description="Comer um pouco mais do que você gasta"
					hint="+300 kcal"
				/>
			</RadioGroup>
		);
	},
};

export const SliderDeMedida: Story = {
	name: "MeasureSlider",
	render: function Render() {
		const [weight, setWeight] = useState(75);
		return (
			<div className="max-w-md">
				<MeasureSlider
					label="Peso"
					icon={Weight}
					unit="kg"
					value={weight}
					min={30}
					max={200}
					step={0.5}
					buttonStep={0.1}
					fractionDigits={1}
					caption="= 165 g de proteína por dia"
					onValueChange={setWeight}
				/>
			</div>
		);
	},
};

export const CartaoComInterruptor: Story = {
	name: "SwitchCard",
	render: function Render() {
		const [checked, setChecked] = useState(true);
		return (
			<div className="max-w-md">
				<SwitchCard
					icon={Scale}
					title="Lembrete de pesagem"
					description="Uma vez por semana, de manhã."
					checked={checked}
					onCheckedChange={setChecked}
				/>
			</div>
		);
	},
};

export const SecaoDeFormulario: Story = {
	name: "FormSection",
	render: () => (
		<div className="max-w-md">
			<FormSection
				title="Treinos"
				description="Musculação e cardio entram no gasto do dia."
			>
				<div className="flex items-center gap-2 rounded-2xl bg-card p-4 text-sm">
					<Dumbbell className="size-4 text-primary" />
					Musculação · 4× por semana · 60 min
				</div>
			</FormSection>
		</div>
	),
};

export const CabecalhoDePagina: Story = {
	name: "PageHeader",
	render: () => (
		<PageHeader
			title="Dieta"
			description="Suas refeições e o total do dia comparado com a sua meta."
		/>
	),
};

export const StatusDeSalvamento: Story = {
	name: "SaveStatus",
	render: () => (
		<div className="flex flex-wrap gap-3 rounded-3xl bg-primary p-4 text-primary-foreground">
			<SaveStatus status="saving" isExample={false} />
			<SaveStatus status="saved" isExample={false} />
			<SaveStatus status="error" isExample={false} />
			<SaveStatus status="idle" isExample />
		</div>
	),
};

export const PerguntasFrequentes: Story = {
	name: "FaqList",
	render: () => (
		<div className="max-w-xl">
			<FaqList
				items={[
					{
						question: "Preciso de whey?",
						answer:
							"Não. Whey é só comida prática: frango, ovo, carne e laticínios batem a meta do mesmo jeito.",
					},
					{
						question: "O Sálvia substitui nutricionista?",
						answer:
							"Não. É uma ferramenta de cálculo e planejamento: ajuda a montar a dieta pelas metas que você definiu.",
					},
				]}
			/>
		</div>
	),
};

export const Marca: Story = {
	name: "Logo",
	render: () => <Logo />,
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { DietPreview } from "~/domains/diet/components/diet-preview";
import { SAMPLE_MEALS } from "~/domains/landing/utils/sample-data";
import { SupplementSheet } from "~/domains/supplements/components/supplement-sheet";
import { SupplementsPreview } from "~/domains/supplements/components/supplements-preview";
import type { Supplement } from "~/domains/supplements/types/supplement-types";
import { Button } from "~/shared/components/ui/button";

const [breakfast, lunch] = SAMPLE_MEALS;

const SAMPLE_SUPPLEMENTS: Supplement[] = [
	{
		id: "s1",
		name: "Creatina",
		dose: 5,
		unit: "g",
		timing: "meal",
		mealId: breakfast.id,
		time: null,
		days: "every_day",
		weekdays: [],
		note: null,
	},
	{
		id: "s2",
		name: "Multivitamínico",
		dose: 1,
		unit: "capsule",
		timing: "meal",
		mealId: lunch.id,
		time: null,
		days: "every_day",
		weekdays: [],
		note: null,
	},
	{
		id: "s3",
		name: "Cafeína",
		dose: 200,
		unit: "mg",
		timing: "before_workout",
		mealId: null,
		time: null,
		days: "training_days",
		weekdays: [],
		note: "30 min antes",
	},
	{
		id: "s4",
		name: "Vitamina D",
		dose: 2000,
		unit: "iu",
		timing: "time",
		mealId: null,
		time: "08:00",
		days: "weekdays",
		weekdays: [1, 3, 5],
		note: null,
	},
];

// O card da Dieta (`SupplementsCard`) chama Server Actions e fica de fora;
// aqui vão o bloco só de leitura e o painel de adicionar/editar.
const meta = {
	title: "Dieta/Suplementação",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Suplementação no fim da dieta: só anotação (não entra nas calorias). O Sálvia não indica suplemento nem dose; a pessoa anota o que toma ou o que o nutricionista passou.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bloco: Story = {
	name: "Visualizar / PDF",
	render: () => (
		<div className="max-w-2xl">
			<SupplementsPreview
				supplements={SAMPLE_SUPPLEMENTS}
				meals={SAMPLE_MEALS}
			/>
		</div>
	),
};

export const NaDieta: Story = {
	name: "Depois das refeições",
	render: () => (
		<div className="max-w-2xl">
			<DietPreview
				meals={SAMPLE_MEALS.slice(0, 2)}
				supplements={SAMPLE_SUPPLEMENTS}
			/>
		</div>
	),
};

function SheetDemo({ editing }: { editing: Supplement | "new" }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Abrir painel</Button>
			<SupplementSheet
				editing={open ? editing : null}
				meals={SAMPLE_MEALS}
				onOpenChange={setOpen}
				onSave={async () => {
					setOpen(false);
					return true;
				}}
				onDelete={() => setOpen(false)}
			/>
		</>
	);
}

export const Adicionar: Story = {
	name: "Painel: adicionar",
	render: () => <SheetDemo editing="new" />,
};

export const Editar: Story = {
	name: "Painel: editar",
	render: () => <SheetDemo editing={SAMPLE_SUPPLEMENTS[3]} />,
};

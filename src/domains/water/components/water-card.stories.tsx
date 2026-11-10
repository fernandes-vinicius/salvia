import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { addDays } from "~/domains/checkin/utils/checkin";
import { WaterCard } from "~/domains/water/components/water-card";
import type { WaterDay } from "~/domains/water/types/water-types";

const TODAY = "2026-11-06";
const TARGET = 3500;
const past = (offset: number, ml: number): WaterDay => ({
	day: addDays(TODAY, offset),
	ml,
	targetMl: TARGET,
	entries: offset === 0 ? [ml] : [],
});

const meta = {
	title: "App/Água de hoje",
	component: WaterCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Registro da água do dia no Início: atalhos de um toque ou outra quantidade (ml ou litros), contra o recomendado (`suggestedWater`). Bater a meta comemora; a sequência e a semana contam os dias em que bateu. Aqui a gravação está mockada.",
			},
		},
	},
	args: {
		water: { minimumMl: 2800, recommendedMl: TARGET, trainingMl: 300 },
		today: TODAY,
		initialLogs: [],
		save: async () => ({ ok: true as const }),
	},
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof WaterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComecoDoDia: Story = { name: "Começo do dia" };

export const QuaseLa: Story = {
	name: "Quase lá (com sequência)",
	args: {
		initialLogs: [
			past(-3, 3600),
			past(-2, 3500),
			past(-1, 4000),
			past(0, 3000),
		],
	},
};

export const MetaBatida: Story = {
	name: "Meta batida",
	args: {
		initialLogs: [past(-5, 2000), past(-1, 3500), past(0, 3800)],
	},
};

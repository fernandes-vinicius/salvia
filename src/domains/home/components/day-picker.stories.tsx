import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

import { addDays } from "~/domains/checkin/utils/checkin";
import { DayPicker } from "~/domains/home/components/day-picker";
import type { DiaryDayKind } from "~/domains/home/utils/diary";

const TODAY = "2026-11-18";

/** A month of sample days: mostly complete, some partial, a few empty. */
const kinds: Record<string, DiaryDayKind> = Object.fromEntries(
	Array.from({ length: 40 }, (_, index) => {
		const day = addDays(TODAY, -index);
		const kind: DiaryDayKind =
			index % 5 === 3 ? "none" : index % 3 === 1 ? "partial" : "full";
		return [day, kind];
	}),
);

const meta = {
	title: "App/Seletor de data do Início",
	component: DayPicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Diário do Início: setas pro dia anterior e o próximo, a data abre o calendário e a semana mostra cada dia com bolinha (completo, parte, nada). Num dia passado aparece o aviso com "Voltar pra hoje". O dia vai na URL (`?dia=`).',
			},
		},
	},
	args: { today: TODAY, day: TODAY, kinds },
	decorators: [
		(Story) => (
			<NuqsTestingAdapter>
				<div className="max-w-md">
					<Story />
				</div>
			</NuqsTestingAdapter>
		),
	],
} satisfies Meta<typeof DayPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hoje: Story = {};

export const Ontem: Story = { args: { day: addDays(TODAY, -1) } };

export const SemanaPassada: Story = {
	name: "Dia da semana passada",
	args: { day: addDays(TODAY, -9) },
};

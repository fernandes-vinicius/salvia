import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { CheckinCard } from "~/domains/checkin/components/checkin-card";
import type {
	Checkin,
	CheckinMeal,
} from "~/domains/checkin/types/checkin-types";
import { addDays } from "~/domains/checkin/utils/checkin";
import { CelebrationProvider } from "~/providers/celebration-provider";
import { PlantProvider } from "~/shared/components/mascot/plant-context";

const TODAY = "2026-11-10";
const MEALS: CheckinMeal[] = [
	{ id: "cafe", name: "Café da manhã", time: "07:30" },
	{ id: "almoco", name: "Almoço", time: "12:30" },
	{ id: "lanche", name: "Lanche", time: "16:00" },
	{ id: "jantar", name: "Jantar", time: "20:00" },
];

const done = (mealId: string, day = TODAY): Checkin => ({
	mealId,
	day,
	status: "done",
});
/** Full days before today, for the streak. */
const pastDays = (count: number) =>
	Array.from({ length: count }, (_, i) =>
		MEALS.map((meal) => done(meal.id, addDays(TODAY, -(i + 1)))),
	).flat();

// The card only uses the router to refresh after a stale check-in; the
// Storybook App Router mode breaks with Next 16, so a no-op router is given.
const noop = () => {};
const router = {
	back: noop,
	forward: noop,
	refresh: noop,
	push: noop,
	replace: noop,
	prefetch: noop,
	bfcacheId: "story",
};

const meta = {
	title: "App/Segui a dieta hoje",
	component: CheckinCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Check-in das refeições no Início: "Comi" ou "Furei" por refeição, sequência e semana. O jarrinho do canto ganha uma folha por refeição seguida e floresce no dia completo; cada "Comi" mostra o balão do mascote. Aqui a gravação está mockada.',
			},
		},
	},
	args: { meals: MEALS, today: TODAY, initialCheckins: [] },
	decorators: [
		(Story, { args }) => (
			<AppRouterContext value={router}>
				<CelebrationProvider enabled>
					<PlantProvider initial={{ leaves: 0, bloom: false }}>
						<div className="max-w-md" key={args.initialCheckins.length}>
							<Story />
						</div>
					</PlantProvider>
				</CelebrationProvider>
			</AppRouterContext>
		),
	],
} satisfies Meta<typeof CheckinCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComecoDoDia: Story = { name: "Começo do dia" };

export const MeioDoDia: Story = {
	name: "Duas refeições seguidas",
	args: { initialCheckins: [...pastDays(2), done("cafe"), done("almoco")] },
};

export const DiaCompleto: Story = {
	name: "Dia completo",
	args: {
		initialCheckins: [...pastDays(4), ...MEALS.map((meal) => done(meal.id))],
	},
};

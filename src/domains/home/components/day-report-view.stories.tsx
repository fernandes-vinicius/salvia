import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DayReportView } from "~/domains/home/components/day-report-view";
import { buildDayReport } from "~/domains/home/utils/day-report";
import { SAMPLE_MEALS } from "~/domains/landing/utils/sample-data";
import type { Supplement } from "~/domains/supplements/types/supplement-types";

const DAY = "2026-11-17";

const supplements: Supplement[] = [
	{
		id: "creatina",
		name: "Creatina",
		dose: 5,
		unit: "g",
		timing: "wake_up",
		mealId: null,
		time: null,
		days: "every_day",
		weekdays: [],
		note: null,
	},
];

const report = buildDayReport({
	day: DAY,
	meals: SAMPLE_MEALS,
	checkins: SAMPLE_MEALS.map((meal, index) => ({
		mealId: meal.id,
		day: DAY,
		status: index === 2 ? "skipped" : "done",
	})),
	water: { day: DAY, ml: 2250, targetMl: 2800, entries: [500, 500, 1000, 250] },
	waterTargetMl: 2800,
	supplements,
	taken: ["creatina"],
	weightKg: 82.4,
	proteinCounting: "total",
});

const meta = {
	title: "App/Relatório do dia",
	component: DayReportView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Relatório de um dia do diário (tela e PDF): refeições com o que foi marcado, plano × meta, água, suplementos e pesagem.",
			},
		},
	},
	args: {
		report,
		proteinCounting: "total",
		targets: { protein: 150, carbs: 210, fat: 55, kcal: 1935 },
		supplementMeals: SAMPLE_MEALS,
	},
} satisfies Meta<typeof DayReportView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Dia com uma refeição furada" };

export const SemMeta: Story = { name: "Sem meta", args: { targets: null } };

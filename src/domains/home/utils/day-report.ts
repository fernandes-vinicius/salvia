import type {
	Checkin,
	CheckinStatus,
} from "~/domains/checkin/types/checkin-types";
import { dayCounts, isFullDay } from "~/domains/checkin/utils/checkin";
import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import { mealMacros } from "~/domains/diet/utils/diet";
import { kcalFor } from "~/domains/food/utils/food";
import {
	countedProtein,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import { diaryLongDate } from "~/domains/home/utils/diary";
import type { Supplement } from "~/domains/supplements/types/supplement-types";
import type { WaterDay } from "~/domains/water/types/water-types";
import { waterAmountLabel } from "~/domains/water/utils/water-log";
import { APP_NAME } from "~/shared/lib/app-config";
import { formatNumber } from "~/shared/lib/format";

export interface DayReportMeal {
	id: string;
	name: string;
	time: string | null;
	/** O que a pessoa marcou no dia ("comi a opção" conta como comi). */
	status: Exclude<CheckinStatus, "option"> | null;
	items: DietItem[];
	protein: number;
	carbs: number;
	fat: number;
	kcal: number;
}

interface DayReportInput {
	day: string;
	/** Dieta atual (não há histórico do plano). */
	meals: DietMeal[];
	checkins: Checkin[];
	water: WaterDay | undefined;
	/** Recomendado de agora, pra quando o dia não tem registro de água. */
	waterTargetMl: number | null;
	/** Só os que valem no dia (`supplementsForDay`). */
	supplements: Supplement[];
	/** Ids marcados como tomados no dia. */
	taken: string[];
	weightKg: number | null;
	proteinCounting: ProteinCounting;
}

/** Tudo o que o relatório do dia mostra, a partir do que já está salvo. */
export function buildDayReport(input: DayReportInput) {
	const statusOf = (mealId: string) => {
		const status =
			input.checkins.find(
				(checkin) => checkin.day === input.day && checkin.mealId === mealId,
			)?.status ?? null;
		return status === "option" ? "done" : status;
	};

	const meals: DayReportMeal[] = input.meals
		.filter((meal) => meal.items.length > 0)
		.map((meal) => {
			const macros = mealMacros(meal);
			return {
				id: meal.id,
				name: meal.name,
				time: meal.time,
				status: statusOf(meal.id),
				items: meal.items,
				protein: countedProtein(macros, input.proteinCounting),
				carbs: macros.carbs,
				fat: macros.fat,
				kcal: kcalFor(macros),
			};
		});

	const totals = meals.reduce(
		(sum, meal) => ({
			protein: sum.protein + meal.protein,
			carbs: sum.carbs + meal.carbs,
			fat: sum.fat + meal.fat,
			kcal: sum.kcal + meal.kcal,
		}),
		{ protein: 0, carbs: 0, fat: 0, kcal: 0 },
	);

	const ml = input.water?.ml ?? 0;
	const targetMl = input.water?.targetMl ?? input.waterTargetMl;
	const takenIds = new Set(input.taken);
	const supplements = input.supplements.map((supplement) => ({
		...supplement,
		taken: takenIds.has(supplement.id),
	}));

	return {
		day: input.day,
		meals,
		mealCount: meals.length,
		followed: Math.min(
			dayCounts(input.checkins, input.day).followed,
			meals.length,
		),
		complete: isFullDay(input.checkins, input.day, meals.length),
		totals,
		water: {
			ml,
			targetMl,
			percent: targetMl ? Math.round((ml / targetMl) * 100) : null,
			entries: input.water?.entries ?? [],
		},
		supplements,
		takenCount: supplements.filter((supplement) => supplement.taken).length,
		weightKg: input.weightKg,
	};
}

export type DayReport = ReturnType<typeof buildDayReport>;

const STATUS_LINES: Record<
	"done" | "skipped" | "none",
	{ mark: string; suffix: string }
> = {
	done: { mark: "✓", suffix: "" },
	skipped: { mark: "✗", suffix: ": furei" },
	none: { mark: "–", suffix: ": não marcou" },
};

/** Texto do dia pra compartilhar (negrito do WhatsApp no título). */
export function dayReportText(report: DayReport, siteUrl: string) {
	const lines = [`*Meu dia na dieta: ${diaryLongDate(report.day)}*`, ""];

	if (report.mealCount > 0) {
		lines.push(
			`Refeições: ${report.followed} de ${report.mealCount}${report.complete ? " (dia completo)" : ""}`,
		);
		for (const meal of report.meals) {
			const { mark, suffix } = STATUS_LINES[meal.status ?? "none"];
			const time = meal.time ? ` (${meal.time})` : "";
			lines.push(`${mark} ${meal.name}${time}${suffix}`);
		}
		lines.push("");
	}

	const { water } = report;
	if (water.ml > 0) {
		lines.push(
			water.targetMl
				? `Água: ${waterAmountLabel(water.ml)} de ${waterAmountLabel(water.targetMl)} (${water.percent}%)`
				: `Água: ${waterAmountLabel(water.ml)}`,
		);
	}
	if (report.supplements.length > 0) {
		const taken = report.supplements
			.filter((supplement) => supplement.taken)
			.map((supplement) => supplement.name);
		lines.push(
			`Suplementos: ${report.takenCount} de ${report.supplements.length}${taken.length > 0 ? ` (${taken.join(", ")})` : ""}`,
		);
	}
	if (report.weightKg !== null) {
		lines.push(`Pesagem: ${formatNumber(report.weightKg, 1)} kg`);
	}
	if (lines.at(-1) !== "") lines.push("");

	lines.push(`Feito com ${APP_NAME} · ${siteUrl}`);
	return lines.join("\n");
}

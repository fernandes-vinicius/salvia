"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { setCheckinAction } from "~/domains/checkin/actions/checkin-actions";
import type {
	Checkin,
	CheckinMeal,
	CheckinStatus,
} from "~/domains/checkin/types/checkin-types";
import {
	checkinStreak,
	dayCounts,
	type WeekDayState,
	weekSummary,
} from "~/domains/checkin/utils/checkin";
import {
	ArrowLeftRight,
	Check,
	CircleCheck,
	Flame,
	type LucideIcon,
	XIcon,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { cn } from "~/shared/lib/utils";

const STATUS_BUTTONS: {
	status: CheckinStatus;
	label: string;
	icon: LucideIcon;
	/** Só aparece se a refeição tem opção ("ou 1 banana"). */
	needsOptions?: boolean;
}[] = [
	{ status: "done", label: "Comi", icon: Check },
	{
		status: "option",
		label: "Opção",
		icon: ArrowLeftRight,
		needsOptions: true,
	},
	{ status: "skipped", label: "Furei", icon: XIcon },
];

const DAY_STATES: Record<WeekDayState, { className: string; label: string }> = {
	full: {
		className: "bg-primary text-primary-foreground",
		label: "dia completo",
	},
	partial: {
		className: "bg-secondary text-secondary-foreground",
		label: "parte das refeições",
	},
	skipped: {
		className: "bg-destructive/15 text-destructive",
		label: "furou",
	},
	none: { className: "bg-muted text-muted-foreground", label: "sem check-in" },
};

interface CheckinCardProps {
	meals: CheckinMeal[];
	/** Hoje no fuso do app (o mesmo que o servidor usa ao gravar). */
	today: string;
	initialCheckins: Checkin[];
}

// "Segui a dieta?": um toque por refeição (comi, comi a opção, furei), com a
// sequência de dias completos e a semana. Tocar de novo desmarca.
export function CheckinCard({
	meals,
	today,
	initialCheckins,
}: CheckinCardProps) {
	const router = useRouter();
	const [checkins, setCheckins] = useState(initialCheckins);

	const statusOf = (mealId: string) =>
		checkins.find((c) => c.day === today && c.mealId === mealId)?.status ??
		null;

	async function mark(meal: CheckinMeal, status: CheckinStatus) {
		const next = statusOf(meal.id) === status ? null : status;
		const previous = checkins;
		setCheckins((current) => [
			...current.filter((c) => !(c.day === today && c.mealId === meal.id)),
			...(next ? [{ mealId: meal.id, day: today, status: next }] : []),
		]);

		const result = await setCheckinAction({ mealId: meal.id, status: next });
		if (!result.ok) {
			setCheckins(previous);
			if (result.stale) {
				toast.info("Sua dieta mudou em outra aba ou aparelho. Atualizamos.");
				router.refresh();
			} else {
				toast.error(result.error);
			}
		}
	}

	const mealCount = meals.length;
	const { followed } = dayCounts(checkins, today);
	const streak = checkinStreak(checkins, mealCount, today);
	const week = weekSummary(checkins, mealCount, today);
	const complete = followed >= mealCount;

	return (
		<section
			aria-labelledby="checkin-title"
			className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<h2
						id="checkin-title"
						className="flex items-center gap-2 font-heading font-semibold"
					>
						<CircleCheck className="size-4 text-primary" />
						Segui a dieta hoje?
					</h2>
					<p className="text-muted-foreground text-sm tabular-nums">
						{complete
							? "Dia completo. Boa!"
							: `${Math.min(followed, mealCount)} de ${mealCount} refeições seguidas`}
					</p>
				</div>
				{streak > 0 && (
					<p className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground text-xs tabular-nums">
						<Flame className="size-3.5" aria-hidden />
						{streak === 1 ? "1 dia seguido" : `${streak} dias seguidos`}
					</p>
				)}
			</div>

			<ul className="flex flex-col divide-y divide-border">
				{meals.map((meal) => {
					const current = statusOf(meal.id);
					return (
						<li
							key={meal.id}
							className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5"
						>
							<span className="min-w-0 text-sm">
								<span className="font-medium">{meal.name}</span>
								{meal.time && (
									<span className="ml-1.5 text-muted-foreground tabular-nums">
										{meal.time}
									</span>
								)}
							</span>
							<fieldset className="flex gap-1.5">
								<legend className="sr-only">Check-in de {meal.name}</legend>
								{STATUS_BUTTONS.filter(
									(button) => !button.needsOptions || meal.hasOptions,
								).map((button) => {
									const pressed = current === button.status;
									return (
										<Button
											key={button.status}
											size="sm"
											variant={
												pressed
													? button.status === "skipped"
														? "destructive"
														: "default"
													: "outline"
											}
											aria-pressed={pressed}
											onClick={() => mark(meal, button.status)}
										>
											<button.icon data-icon="inline-start" />
											{button.label}
										</Button>
									);
								})}
							</fieldset>
						</li>
					);
				})}
			</ul>

			<div className="flex flex-col gap-2">
				<ol aria-label="Últimos 7 dias" className="grid grid-cols-7 gap-1.5">
					{week.days.map((day) => (
						<li key={day.day} className="flex flex-col items-center gap-1">
							<span
								className={cn(
									"flex size-8 items-center justify-center rounded-full",
									DAY_STATES[day.state].className,
									day.isToday &&
										"ring-2 ring-primary/40 ring-offset-2 ring-offset-card",
								)}
							>
								{day.state === "full" && (
									<Check className="size-4" aria-hidden />
								)}
								<span className="sr-only">
									{day.isToday ? "Hoje" : day.name}:{" "}
									{DAY_STATES[day.state].label}
								</span>
							</span>
							<span
								aria-hidden
								className={cn(
									"text-muted-foreground text-xs",
									day.isToday && "font-semibold text-foreground",
								)}
							>
								{day.label}
							</span>
						</li>
					))}
				</ol>
				{week.adherence !== null && (
					<p className="text-muted-foreground text-xs tabular-nums">
						Na semana: {week.adherence}% das refeições seguidas.
					</p>
				)}
			</div>
		</section>
	);
}

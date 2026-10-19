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
	celebrationFor,
	checkinStreak,
	dayCounts,
	milestoneMessage,
	type WeekDayState,
	weekSummary,
} from "~/domains/checkin/utils/checkin";
import {
	useCelebrate,
	useCelebrationsEnabled,
} from "~/providers/celebration-provider";
import {
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
}[] = [
	{ status: "done", label: "Comi", icon: Check },
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

// "Segui a dieta?": um toque por refeição (comi ou furei; comer a opção do
// alimento também é "comi"), com a
// sequência de dias completos e a semana. Tocar de novo desmarca.
export function CheckinCard({
	meals,
	today,
	initialCheckins,
}: CheckinCardProps) {
	const router = useRouter();
	const [checkins, setCheckins] = useState(initialCheckins);
	const celebrate = useCelebrate();
	const animate = useCelebrationsEnabled();
	// Botão que acabou de ser marcado (pop + ✓ desenhado) e se o dia acabou de
	// completar (texto e selo 🔥 entram animados). Só em transições.
	const [popped, setPopped] = useState<string | null>(null);
	const [justCompleted, setJustCompleted] = useState(false);

	// "Comi a opção" (marcações antigas) aparece e se comporta como "Comi".
	const statusOf = (mealId: string) => {
		const status =
			checkins.find((c) => c.day === today && c.mealId === mealId)?.status ??
			null;
		return status === "option" ? "done" : status;
	};

	async function mark(
		meal: CheckinMeal,
		status: CheckinStatus,
		origin: DOMRect,
	) {
		const next = statusOf(meal.id) === status ? null : status;
		const previous = checkins;
		const updated = [
			...checkins.filter((c) => !(c.day === today && c.mealId === meal.id)),
			...(next ? [{ mealId: meal.id, day: today, status: next }] : []),
		];
		setCheckins(updated);
		celebrateChange(previous, updated, meal.id, status, origin);

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

	function celebrateChange(
		before: Checkin[],
		after: Checkin[],
		mealId: string,
		status: CheckinStatus,
		origin: DOMRect,
	) {
		const level = celebrationFor({
			before,
			after,
			mealCount: meals.length,
			today,
		});
		if (!level) return;

		setPopped(`${mealId}:${status}`);
		setTimeout(() => setPopped(null), 450);
		celebrate("tap", origin);
		if (level === "tap") return;

		setJustCompleted(true);
		// Depois das partículas do botão, a festa maior.
		setTimeout(() => celebrate(level), 250);
		if (level === "milestone") showMilestone(after);
	}

	/** Aviso do marco, uma vez por dia (não repete ao desmarcar/remarcar). */
	function showMilestone(after: Checkin[]) {
		const key = `salvia:marco:${today}`;
		try {
			if (localStorage.getItem(key)) return;
			localStorage.setItem(key, "1");
		} catch {
			// Sem armazenamento: o aviso pode repetir, sem problema.
		}
		const streak = checkinStreak(after, meals.length, today);
		toast.success(`🔥 ${streak} dias seguidos!`, {
			description: milestoneMessage(streak),
			duration: 6000,
		});
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
					<p
						key={complete ? "complete" : "progress"}
						className={cn(
							"text-muted-foreground text-sm tabular-nums",
							complete &&
								justCompleted &&
								animate &&
								"origin-left font-medium text-primary motion-safe:animate-celebrate-in",
						)}
					>
						{complete
							? "Dia completo. Boa!"
							: `${Math.min(followed, mealCount)} de ${mealCount} refeições seguidas`}
					</p>
				</div>
				{streak > 0 && (
					<p
						key={streak}
						className={cn(
							"flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground text-xs tabular-nums",
							justCompleted && animate && "motion-safe:animate-celebrate-in",
						)}
					>
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
								{STATUS_BUTTONS.map((button) => {
									const pressed = current === button.status;
									const pop =
										animate && popped === `${meal.id}:${button.status}`;
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
											className={cn(pop && "motion-safe:animate-pop")}
											onClick={(event) =>
												mark(
													meal,
													button.status,
													event.currentTarget.getBoundingClientRect(),
												)
											}
										>
											<button.icon
												data-icon="inline-start"
												className={cn(pop && "motion-safe:animate-check")}
											/>
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

"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";

import type { WaterResult as WaterNeed } from "~/domains/calculators/utils/water";
import {
	setTodayWaterAction,
	type WaterResult,
} from "~/domains/water/actions/water-actions";
import { WaterCelebration } from "~/domains/water/components/water-celebration";
import type { WaterDay } from "~/domains/water/types/water-types";
import {
	parseWaterAmount,
	recordWater,
	undoWater,
	WATER_QUICK_ADDS,
	type WaterDayState,
	type WaterHistory,
	waterAmountLabel,
	waterCelebrationFor,
	waterStreak,
	waterWeek,
} from "~/domains/water/utils/water-log";
import {
	type WaterMoment,
	waterMoment,
} from "~/domains/water/utils/water-moment";
import {
	useCelebrate,
	useCelebrationsEnabled,
} from "~/providers/celebration-provider";
import { Check, Droplet, Pencil, RotateCcw } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Progress } from "~/shared/components/ui/progress";
import { useAutosave } from "~/shared/hooks/use-autosave";
import { analytics } from "~/shared/lib/analytics/analytics";
import { cn } from "~/shared/lib/utils";

const DAY_STATES: Record<WaterDayState, { className: string; label: string }> =
	{
		full: {
			className: "bg-primary text-primary-foreground",
			label: "meta batida",
		},
		partial: {
			className: "bg-secondary text-secondary-foreground",
			label: "abaixo da meta",
		},
		none: {
			className: "bg-muted text-muted-foreground",
			label: "sem registro",
		},
	};

interface WaterCardProps {
	/** `suggestedWater` do perfil (peso + média de treino da semana). */
	water: WaterNeed;
	/** Hoje no fuso do app (o mesmo que o servidor usa ao gravar). */
	today: string;
	initialLogs: WaterDay[];
	/** Grava o total de hoje (trocável na story). */
	save?: (data: WaterHistory) => Promise<WaterResult>;
}

// Água de hoje no Início: atalhos de um toque (copo, garrafa…) ou outra
// quantidade, contra o recomendado do dia. Bater a meta comemora; a sequência
// e a semana contam os dias em que bateu. Salva sozinho.
export function WaterCard({
	water,
	today,
	initialLogs,
	save = setTodayWaterAction,
}: WaterCardProps) {
	const [logs, setLogs] = useState(initialLogs);
	// Jarrinho sendo regado depois de um registro (id novo reinicia).
	const [watered, setWatered] = useState<{
		id: number;
		moment: WaterMoment;
		percent: number;
	} | null>(null);
	const closeWatered = useCallback(() => setWatered(null), []);
	const [customOpen, setCustomOpen] = useState(false);
	const [custom, setCustom] = useState("");
	const [customError, setCustomError] = useState<string | null>(null);
	const [justMet, setJustMet] = useState(false);
	const celebrate = useCelebrate();
	const animate = useCelebrationsEnabled();

	const { schedule } = useAutosave<WaterHistory>({
		save: async (history) => {
			const result = await save(history);
			if (!result.ok) toast.error(result.error);
			return result.ok;
		},
	});

	const target = water.recommendedMl;
	const todayLog = logs.find((log) => log.day === today);
	const total = todayLog?.ml ?? 0;
	const history: WaterHistory = { ml: total, entries: todayLog?.entries ?? [] };

	/** Grava o novo estado de hoje e devolve os registros atualizados. */
	function apply(next: WaterHistory) {
		const updated = [
			...logs.filter((log) => log.day !== today),
			{ day: today, ml: next.ml, targetMl: target, entries: next.entries },
		];
		setLogs(updated);
		schedule(next);
		return updated;
	}

	function change(ml: number, origin?: DOMRect) {
		const next = recordWater(history, ml);
		if (next === history) return;
		const updated = apply(next);
		const level = waterCelebrationFor({ before: logs, after: updated, today });
		if (ml > 0) {
			analytics.track("agua_registrada", { ml, meta: next.ml >= target });
			if (origin) celebrate("tap", origin);
			if (animate) {
				setWatered({
					id: Date.now(),
					percent: Math.min(100, Math.round((next.ml / target) * 100)),
					moment: waterMoment({
						level,
						added: next.ml - total,
						total: next.ml,
						target,
						streak: waterStreak(updated, today),
					}),
				});
			}
		}
		if (!level) return;

		setJustMet(true);
		// Com o jarrinho na tela, a chuva e o marco aparecem nele.
		if (animate) return;
		setTimeout(() => celebrate(level), origin ? 250 : 0);
		if (level === "milestone") showMilestone(waterStreak(updated, today));
	}

	/** Aviso do marco, uma vez por dia (não repete ao tirar e pôr de novo). */
	function showMilestone(streak: number) {
		const key = `salvia:marco-agua:${today}`;
		try {
			if (localStorage.getItem(key)) return;
			localStorage.setItem(key, "1");
		} catch {
			// Sem armazenamento: o aviso pode repetir, sem problema.
		}
		toast.success(`💧 ${streak} dias seguidos na meta de água!`, {
			duration: 6000,
		});
	}

	/** Desfaz o último registro de hoje; tocando de novo, o anterior. */
	function undo() {
		const previous = undoWater(history);
		if (previous) apply(previous);
	}

	function applyCustom(sign: 1 | -1) {
		const ml = parseWaterAmount(custom);
		if (ml === null) {
			setCustomError("Digite em ml (300) ou em litros (1,5).");
			return;
		}
		setCustomError(null);
		setCustom("");
		change(sign * ml);
	}

	const met = total >= target;
	const left = Math.max(0, target - total);
	const streak = waterStreak(logs, today);
	const week = waterWeek(logs, today);
	const lastEntry = history.entries.at(-1);

	return (
		<section
			aria-labelledby="water-title"
			className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h2
					id="water-title"
					className="flex items-center gap-2 font-heading font-semibold"
				>
					<Droplet className="size-4 text-primary" />
					Água de hoje
				</h2>
				{streak > 0 && (
					<p
						key={streak}
						className={cn(
							"flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground text-xs tabular-nums",
							justMet && animate && "motion-safe:animate-celebrate-in",
						)}
					>
						<Droplet className="size-3.5" aria-hidden />
						{streak === 1 ? "1 dia seguido" : `${streak} dias seguidos`}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<p className="font-heading tabular-nums">
					<span className="font-semibold text-2xl">
						{waterAmountLabel(total)}
					</span>{" "}
					<span className="text-muted-foreground text-sm">
						de {waterAmountLabel(target)}
					</span>
				</p>
				<Progress
					value={Math.min(100, Math.round((total / target) * 100))}
					aria-label="Água de hoje"
				/>
				<p
					key={met ? "met" : "left"}
					aria-live="polite"
					className={cn(
						"text-muted-foreground text-sm tabular-nums",
						met && "font-medium text-primary",
						met &&
							justMet &&
							animate &&
							"origin-left motion-safe:animate-celebrate-in",
					)}
				>
					{met
						? "Meta do dia batida. Boa!"
						: `Faltam ${waterAmountLabel(left)}`}
				</p>
			</div>

			<div className="flex flex-col gap-2">
				<fieldset className="flex flex-wrap gap-2">
					<legend className="sr-only">Adicionar água</legend>
					{WATER_QUICK_ADDS.map((ml) => (
						<Button
							key={ml}
							variant="outline"
							size="sm"
							onClick={(event) =>
								change(ml, event.currentTarget.getBoundingClientRect())
							}
						>
							+ {waterAmountLabel(ml)}
						</Button>
					))}
				</fieldset>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="ghost"
						size="sm"
						aria-expanded={customOpen}
						onClick={() => setCustomOpen((open) => !open)}
					>
						<Pencil data-icon="inline-start" />
						Outra quantidade
					</Button>
					{lastEntry !== undefined && (
						<Button variant="ghost" size="sm" onClick={undo}>
							<RotateCcw data-icon="inline-start" />
							Desfazer {lastEntry > 0 ? "+" : "−"}{" "}
							{waterAmountLabel(Math.abs(lastEntry))}
							{history.entries.length > 1 && (
								<span className="text-muted-foreground tabular-nums">
									({history.entries.length})
								</span>
							)}
						</Button>
					)}
				</div>
				{customOpen && (
					<form
						onSubmit={(event: FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							applyCustom(1);
						}}
						className="flex flex-col gap-1.5"
					>
						<label htmlFor="water-custom" className="font-medium text-sm">
							Quantidade
						</label>
						<div className="flex flex-wrap gap-2">
							<Input
								id="water-custom"
								inputMode="decimal"
								autoComplete="off"
								placeholder="300 ml ou 1,5 L"
								value={custom}
								onChange={(event) => setCustom(event.target.value)}
								aria-invalid={customError ? true : undefined}
								aria-describedby={
									customError ? "water-custom-error" : undefined
								}
								className="min-w-0 flex-1 basis-32"
							/>
							<Button type="submit" size="sm">
								Adicionar
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={total === 0}
								onClick={() => applyCustom(-1)}
							>
								Tirar
							</Button>
						</div>
						{customError && (
							<p id="water-custom-error" className="text-destructive text-xs">
								{customError}
							</p>
						)}
					</form>
				)}
			</div>

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
				{week.metDays > 0 && (
					<p className="text-muted-foreground text-xs tabular-nums">
						Meta batida em {week.metDays} dos últimos 7 dias.
					</p>
				)}
			</div>

			{watered && (
				<WaterCelebration
					key={watered.id}
					moment={watered.moment}
					percent={watered.percent}
					onDone={closeWatered}
				/>
			)}

			<p className="rounded-2xl bg-muted px-4 py-3 text-muted-foreground text-xs">
				Meta pelo seu peso e pelo treino da semana. No dia de descanso, o mínimo
				é{" "}
				<span className="font-medium text-foreground tabular-nums">
					{waterAmountLabel(water.minimumMl)}
				</span>
				.{" "}
				<Link
					href="/calculadoras/agua"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Calcular com calor e suor
				</Link>
			</p>
		</section>
	);
}

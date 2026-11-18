"use client";

import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useState, useTransition } from "react";

import { addDays } from "~/domains/checkin/utils/checkin";
import {
	type DiaryDayKind,
	diaryDayLabel,
	diaryDayPhrase,
	earliestDiaryDay,
	isDiaryDay,
	monthGrid,
	monthTitle,
	shiftMonth,
	weekdayLetter,
	weekOf,
} from "~/domains/home/utils/diary";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	CalendarDays,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	FileDown,
	History,
	Loader2Icon,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { analytics } from "~/shared/lib/analytics/analytics";
import { cn } from "~/shared/lib/utils";

const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface DayPickerProps {
	/** Hoje no fuso do app. */
	today: string;
	/** Dia aberto (já validado no servidor). */
	day: string;
	/** Situação de cada dia com check-in carregado (sem chave = não sabemos). */
	kinds: Record<string, DiaryDayKind>;
}

// Seletor de data do Início (estilo app de finanças): setas pra dia anterior e
// próximo, a data abre o calendário e a faixa da semana mostra os dias com
// bolinha (completo, parte, nada). O dia vai na URL (`?dia=`) e o servidor
// carrega aquele dia; hoje é sem parâmetro.
export function DayPicker({ today, day, kinds }: DayPickerProps) {
	const [pending, startTransition] = useTransition();
	const [, setDia] = useQueryState(
		"dia",
		parseAsString.withOptions({
			shallow: false,
			history: "replace",
			scroll: false,
			startTransition,
		}),
	);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [month, setMonth] = useState(day.slice(0, 7));

	const earliest = earliestDiaryDay(today);
	const isToday = day === today;
	const label = diaryDayLabel(day, today);
	const phrase = diaryDayPhrase(day, today);

	function go(target: string) {
		if (!isDiaryDay(target, today) || target === day) return;
		if (target !== today) {
			analytics.track("diario_dia_aberto", {
				dias_atras: Math.round(
					(Date.parse(today) - Date.parse(target)) / 86_400_000,
				),
			});
		}
		void setDia(target === today ? null : target);
	}

	function openCalendar() {
		setMonth(day.slice(0, 7));
		setCalendarOpen(true);
	}

	return (
		<section
			aria-label="Escolher o dia"
			aria-busy={pending}
			className="flex flex-col gap-3"
		>
			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					size="icon-lg"
					aria-label="Dia anterior"
					disabled={day <= earliest}
					onClick={() => go(addDays(day, -1))}
					className="size-11 shrink-0 rounded-full bg-card"
				>
					<ChevronLeft />
				</Button>
				<button
					type="button"
					onClick={openCalendar}
					aria-label={`Escolher data. Aberto: ${label.title}, ${label.subtitle}`}
					className="flex h-14 min-w-0 flex-1 items-center justify-center gap-3 rounded-2xl bg-card px-3 outline-none transition-colors hover:bg-card/70 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					{pending ? (
						<Loader2Icon
							className="size-5 shrink-0 animate-spin text-primary"
							aria-hidden
						/>
					) : (
						<CalendarDays
							className="size-5 shrink-0 text-primary"
							aria-hidden
						/>
					)}
					<span className="flex min-w-0 flex-col items-start leading-tight">
						<span className="truncate font-heading font-semibold text-lg">
							{label.title}
						</span>
						<span className="truncate text-muted-foreground text-sm">
							{label.subtitle}
						</span>
					</span>
					<ChevronDown
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden
					/>
				</button>
				<Button
					variant="secondary"
					size="icon-lg"
					aria-label="Próximo dia"
					disabled={isToday}
					onClick={() => go(addDays(day, 1))}
					className="size-11 shrink-0 rounded-full bg-card"
				>
					<ChevronRight />
				</Button>
			</div>

			<ol aria-label="Semana" className="grid grid-cols-7 gap-1">
				{weekOf(day).map((date) => (
					<li key={date} className="flex justify-center">
						<DayButton
							date={date}
							letter={weekdayLetter(date)}
							today={today}
							selected={date === day}
							kind={kinds[date]}
							onPick={go}
						/>
					</li>
				))}
			</ol>

			{!isToday && (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground">
					<History className="size-5 shrink-0" aria-hidden />
					<p className="min-w-0 flex-1 basis-48 text-sm">
						Você está no diário de{" "}
						<span className="font-semibold">{phrase}</span>
						{phrase.endsWith(".") ? " " : ". "}O que marcar aqui fica nesse dia.
					</p>
					<Button size="sm" onClick={() => go(today)}>
						Voltar pra hoje
					</Button>
				</div>
			)}

			<Button
				variant="outline"
				size="sm"
				className="self-start"
				nativeButton={false}
				render={<Link href={`/dashboard/relatorio?dia=${day}`} />}
			>
				<FileDown data-icon="inline-start" />
				Relatório {isToday ? "de hoje" : "do dia"}
			</Button>

			<Sheet open={calendarOpen} onOpenChange={setCalendarOpen}>
				<BottomSheetContent className="sm:max-w-md">
					<SheetHeader className="sr-only">
						<SheetTitle>Escolher data</SheetTitle>
						<SheetDescription>
							Volte a um dia pra ver ou ajustar o que marcou.
						</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col gap-4 overflow-y-auto px-4 pt-3 pb-6">
						<div className="flex items-center justify-between gap-2">
							<Button
								variant="secondary"
								size="icon-lg"
								aria-label="Mês anterior"
								disabled={month <= earliest.slice(0, 7)}
								onClick={() => setMonth(shiftMonth(month, -1))}
								className="size-11 rounded-full"
							>
								<ChevronLeft />
							</Button>
							<p
								aria-live="polite"
								className="font-heading font-semibold text-lg"
							>
								{monthTitle(month)}
							</p>
							<Button
								variant="secondary"
								size="icon-lg"
								aria-label="Próximo mês"
								disabled={month >= today.slice(0, 7)}
								onClick={() => setMonth(shiftMonth(month, 1))}
								className="size-11 rounded-full"
							>
								<ChevronRight />
							</Button>
						</div>

						<div className="grid grid-cols-7 gap-y-1 text-center">
							{WEEKDAY_LETTERS.map((letter, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: fixed weekday header
									key={index}
									aria-hidden
									className="pb-1 font-medium text-muted-foreground text-xs"
								>
									{letter}
								</span>
							))}
							{monthGrid(month).map((date, index) =>
								date ? (
									<div key={date} className="flex justify-center">
										<DayButton
											date={date}
											today={today}
											selected={date === day}
											kind={kinds[date]}
											onPick={(picked) => {
												setCalendarOpen(false);
												go(picked);
											}}
										/>
									</div>
								) : (
									// biome-ignore lint/suspicious/noArrayIndexKey: leading blanks have no date
									<span key={`blank-${index}`} aria-hidden />
								),
							)}
						</div>

						<ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
							<li className="flex items-center gap-1.5">
								<KindDot kind="full" />
								Dia completo
							</li>
							<li className="flex items-center gap-1.5">
								<KindDot kind="partial" />
								Parte do dia
							</li>
							<li className="flex items-center gap-1.5">
								<KindDot kind="none" />
								Nada marcado
							</li>
						</ul>

						<div className="grid grid-cols-2 gap-2">
							<Button
								variant="secondary"
								size="lg"
								disabled={isToday}
								onClick={() => {
									setCalendarOpen(false);
									go(today);
								}}
							>
								Ir pra hoje
							</Button>
							<Button size="lg" onClick={() => setCalendarOpen(false)}>
								Pronto
							</Button>
						</div>
					</div>
				</BottomSheetContent>
			</Sheet>
		</section>
	);
}

const KIND_LABELS: Record<DiaryDayKind, string> = {
	full: "dia completo",
	partial: "parte do dia",
	none: "nada marcado",
};

function DayButton({
	date,
	letter,
	today,
	selected,
	kind,
	onPick,
}: {
	date: string;
	letter?: string;
	today: string;
	selected: boolean;
	kind: DiaryDayKind | undefined;
	onPick: (date: string) => void;
}) {
	const enabled = isDiaryDay(date, today);
	const label = diaryDayLabel(date, today);
	return (
		<button
			type="button"
			disabled={!enabled}
			aria-pressed={selected}
			aria-label={`${label.title}, ${label.subtitle}${enabled && kind ? `: ${KIND_LABELS[kind]}` : ""}`}
			onClick={() => onPick(date)}
			className="group flex min-w-11 flex-col items-center gap-1 rounded-2xl py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40"
		>
			{letter && (
				<span aria-hidden className="font-medium text-muted-foreground text-xs">
					{letter}
				</span>
			)}
			<span
				aria-hidden
				className={cn(
					"flex size-9 items-center justify-center rounded-full font-heading font-semibold text-sm tabular-nums transition-colors",
					selected
						? "bg-primary text-primary-foreground"
						: "group-enabled:group-hover:bg-muted",
					!selected && date === today && "ring-2 ring-primary/50",
				)}
			>
				{Number(date.slice(8))}
			</span>
			<KindDot kind={enabled ? kind : undefined} />
		</button>
	);
}

function KindDot({ kind }: { kind: DiaryDayKind | undefined }) {
	return (
		<span
			aria-hidden
			className={cn(
				"size-1.5 rounded-full",
				kind === "full" && "bg-primary",
				kind === "partial" && "ring-1 ring-primary ring-inset",
				kind === "none" && "bg-muted-foreground/30",
			)}
		/>
	);
}

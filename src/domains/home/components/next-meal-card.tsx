"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays } from "~/domains/checkin/utils/checkin";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { findNextMeal, mealKcal } from "~/domains/home/utils/home";
import type { Supplement } from "~/domains/supplements/types/supplement-types";
import {
	doseLabel,
	mealSupplements,
} from "~/domains/supplements/utils/supplements";
import { Clock, Pill } from "~/shared/components/icons";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { formatNumber } from "~/shared/lib/format";

function nowMinutes() {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

// Calculado no navegador: o horário que importa é o do usuário (o servidor
// pode estar em UTC). Atualiza a cada minuto.
export function NextMealCard({
	meals,
	supplements = [],
	today,
}: {
	meals: DietMeal[];
	/** Os ligados à refeição viram lembrete ("+ Creatina 5 g"). */
	supplements?: Supplement[];
	/** Hoje no fuso do app, pra saber quais valem no dia. */
	today: string;
}) {
	const [minutes, setMinutes] = useState<number | null>(null);

	useEffect(() => {
		setMinutes(nowMinutes());
		const id = setInterval(() => setMinutes(nowMinutes()), 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<section
			aria-label="Próxima refeição"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="flex items-center gap-2 font-heading font-semibold">
				<Clock className="size-4 text-primary" />
				Próxima refeição
			</h2>
			{minutes === null ? (
				<Skeleton className="h-16 rounded-2xl" />
			) : (
				<NextMealContent
					meals={meals}
					minutes={minutes}
					supplements={supplements}
					today={today}
				/>
			)}
		</section>
	);
}

function NextMealContent({
	meals,
	minutes,
	supplements,
	today,
}: {
	meals: DietMeal[];
	minutes: number;
	supplements: Supplement[];
	today: string;
}) {
	const next = findNextMeal(meals, minutes);

	if (!next) {
		return (
			<p className="text-muted-foreground text-sm">
				Defina horários nas refeições (menu ⋯ na aba{" "}
				<Link
					href="/dieta"
					className="text-primary underline-offset-4 hover:underline"
				>
					Dieta
				</Link>
				) para ver o que comer agora.
			</p>
		);
	}

	const { meal, tomorrow } = next;
	const withMeal = mealSupplements(
		supplements,
		meal.id,
		tomorrow ? addDays(today, 1) : today,
	);
	return (
		<div className="flex flex-col gap-2">
			<p className="flex items-baseline justify-between gap-2">
				<span className="font-medium">
					{meal.name}
					<span className="ml-1.5 text-muted-foreground text-sm tabular-nums">
						{tomorrow ? "amanhã, " : ""}
						{meal.time}
					</span>
				</span>
				<span className="text-muted-foreground text-sm tabular-nums">
					{formatNumber(mealKcal(meal))} kcal
				</span>
			</p>
			{meal.items.length > 0 ? (
				<ul className="flex flex-col gap-1 text-sm">
					{meal.items.map((item) => (
						<li key={item.id} className="flex justify-between gap-3">
							<span className="min-w-0 truncate">{item.food.name}</span>
							<span className="shrink-0 text-muted-foreground tabular-nums">
								{formatNumber(item.quantity, 1)}{" "}
								{UNIT_LABELS[item.food.unit].short}
							</span>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted-foreground text-sm">Nenhum alimento ainda.</p>
			)}
			{withMeal.length > 0 && (
				<ul
					aria-label="Suplementos junto"
					className="flex flex-col gap-1 text-sm"
				>
					{withMeal.map((supplement) => (
						<li
							key={supplement.id}
							className="flex items-center gap-1.5 text-muted-foreground"
						>
							<Pill className="size-3.5 shrink-0 text-primary" aria-hidden />
							<span className="min-w-0 truncate">
								+ {supplement.name}{" "}
								<span className="tabular-nums">
									{doseLabel(supplement.dose, supplement.unit)}
								</span>
								{supplement.days === "training_days" && " (se treinar)"}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

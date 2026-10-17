"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Measurement } from "~/domains/measurements/types/measurement-types";
import {
	daysBetween,
	evolutionOf,
	formatDate,
	REMEASURE_AFTER_DAYS,
	seriesOf,
	todayIso,
} from "~/domains/measurements/utils/measurements";
import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	Minus,
	Ruler,
} from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";

function Delta({ delta, unit }: { delta: number; unit: string }) {
	const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
	const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
	return (
		<span className="inline-flex items-center gap-0.5 tabular-nums">
			<Icon className="size-3" aria-hidden />
			{sign}
			{formatNumber(Math.abs(delta), 1)} {unit}
		</span>
	);
}

/**
 * Mini tendência do peso: linha fina em tom discreto e o ponto atual em
 * destaque (dataviz: sparkline no tom de fundo, valor atual no acento). X em
 * tempo real, como no gráfico de Minhas medidas.
 */
function WeightSparkline({ measurements }: { measurements: Measurement[] }) {
	const points = seriesOf(measurements, "weightKg");
	if (points.length < 2) return null;

	const width = 120;
	const height = 36;
	const pad = 4;
	const first = points[0].date;
	const span = Math.max(1, daysBetween(first, points.at(-1)?.date ?? first));
	const values = points.map((p) => p.value);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const coords = points.map((p) => ({
		x: pad + (daysBetween(first, p.date) / span) * (width - pad * 2),
		y: pad + (1 - (p.value - min) / range) * (height - pad * 2),
	}));
	const last = coords.at(-1);

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className="shrink-0"
			role="img"
		>
			<title>
				{`Tendência do peso: de ${formatNumber(values[0], 1)} para ${formatNumber(values.at(-1) ?? 0, 1)} kg`}
			</title>
			<polyline
				points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
				fill="none"
				stroke="var(--muted-foreground)"
				strokeOpacity={0.5}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{last && (
				<circle
					cx={last.x}
					cy={last.y}
					r={4}
					fill="var(--primary)"
					stroke="var(--card)"
					strokeWidth={2}
				/>
			)}
		</svg>
	);
}

// Resumo de Minhas medidas na Início: peso (com tendência), cintura e um
// lembrete quando faz tempo desde a última medição. Os dias são contados no
// navegador (data local do usuário).
export function MeasurementsCard({
	measurements,
}: {
	measurements: Measurement[];
}) {
	const [today, setToday] = useState<string | null>(null);
	useEffect(() => setToday(todayIso()), []);

	if (measurements.length === 0) {
		return (
			<section
				aria-label="Suas medidas"
				className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
			>
				<h2 className="flex items-center gap-2 font-heading font-semibold">
					<Ruler className="size-4 text-primary" />
					Suas medidas
				</h2>
				<p className="text-muted-foreground text-sm">
					Registre peso e medidas de tempos em tempos pra acompanhar sua
					evolução.
				</p>
				<Link
					href="/medidas"
					className="self-start font-medium text-primary text-xs underline-offset-4 hover:underline"
				>
					Registrar primeira medição
				</Link>
			</section>
		);
	}

	const latestDate = measurements
		.map((m) => m.measuredOn)
		.sort()
		.at(-1) as string;
	const weight = evolutionOf(measurements, "weightKg");
	const waist = evolutionOf(measurements, "waistCm");
	const daysSince = today ? daysBetween(latestDate, today) : null;

	return (
		<section
			aria-label="Suas medidas"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex items-center justify-between gap-2">
				<h2 className="flex items-center gap-2 font-heading font-semibold">
					<Ruler className="size-4 text-primary" />
					Suas medidas
				</h2>
				<Link
					href="/medidas"
					className="flex items-center gap-1 font-medium text-primary text-xs hover:underline"
				>
					Ver medidas
					<ArrowRight className="size-3.5" />
				</Link>
			</div>

			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
				{weight && (
					<div className="flex items-end gap-4">
						<div className="flex flex-col">
							<span className="text-muted-foreground text-xs">Peso</span>
							<span className="font-heading font-semibold text-2xl">
								{formatNumber(weight.latest.value, 1)}
								<span className="ml-1 font-normal text-muted-foreground text-sm">
									kg
								</span>
							</span>
							{weight.sinceFirst && (
								<span className="text-muted-foreground text-xs">
									<Delta delta={weight.sinceFirst.delta} unit="kg" /> desde{" "}
									{formatDate(weight.sinceFirst.from.date)}
								</span>
							)}
						</div>
						<WeightSparkline measurements={measurements} />
					</div>
				)}
				{waist && (
					<div className="flex flex-col">
						<span className="text-muted-foreground text-xs">Cintura</span>
						<span className="font-heading font-semibold text-2xl">
							{formatNumber(waist.latest.value, 1)}
							<span className="ml-1 font-normal text-muted-foreground text-sm">
								cm
							</span>
						</span>
						{waist.sinceFirst && (
							<span className="text-muted-foreground text-xs">
								<Delta delta={waist.sinceFirst.delta} unit="cm" />
							</span>
						)}
					</div>
				)}
			</div>

			<p className="text-muted-foreground text-xs">
				{daysSince !== null && daysSince > REMEASURE_AFTER_DAYS ? (
					<>
						Faz {daysSince} dias desde a última medição (
						{formatDate(latestDate)}).{" "}
						<Link
							href="/medidas"
							className="font-medium text-primary underline-offset-4 hover:underline"
						>
							Que tal medir de novo?
						</Link>
					</>
				) : (
					<>Última medição em {formatDate(latestDate)}.</>
				)}
			</p>
		</section>
	);
}

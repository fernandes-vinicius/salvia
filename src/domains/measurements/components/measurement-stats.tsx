"use client";

import type {
	Measurement,
	MeasurementKey,
} from "~/domains/measurements/types/measurement-types";
import {
	evolutionOf,
	fieldOf,
	formatDate,
} from "~/domains/measurements/utils/measurements";
import { ArrowDown, ArrowUp, Minus } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

/** Medidas em destaque no topo (as mais usadas pra acompanhar). */
const HIGHLIGHTS: MeasurementKey[] = [
	"weightKg",
	"waistCm",
	"abdomenCm",
	"hipsCm",
];

interface MeasurementStatsProps {
	measurements: Measurement[];
	selected: MeasurementKey;
	onSelect: (key: MeasurementKey) => void;
}

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

// Cards de resumo: último valor e variação desde a primeira medição. Tocar
// num card mostra essa medida no gráfico.
export function MeasurementStats({
	measurements,
	selected,
	onSelect,
}: MeasurementStatsProps) {
	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{HIGHLIGHTS.map((key) => {
				const field = fieldOf(key);
				const evolution = evolutionOf(measurements, key);
				return (
					<button
						key={key}
						type="button"
						onClick={() => onSelect(key)}
						aria-pressed={key === selected}
						className={cn(
							"flex flex-col gap-1 rounded-3xl bg-card p-4 text-left outline-none ring-2 ring-transparent transition-colors hover:bg-accent focus-visible:ring-ring/50",
							key === selected && "ring-primary/30",
						)}
					>
						<span className="text-muted-foreground text-xs">{field.label}</span>
						{evolution ? (
							<>
								<span className="font-heading font-semibold text-2xl">
									{formatNumber(evolution.latest.value, 1)}
									<span className="ml-1 font-normal text-muted-foreground text-sm">
										{field.unit}
									</span>
								</span>
								<span className="text-muted-foreground text-xs">
									{evolution.sinceFirst ? (
										<>
											<Delta
												delta={evolution.sinceFirst.delta}
												unit={field.unit}
											/>{" "}
											desde {formatDate(evolution.sinceFirst.from.date)}
										</>
									) : (
										`em ${formatDate(evolution.latest.date)}`
									)}
								</span>
							</>
						) : (
							<span className="text-muted-foreground text-sm">
								Sem registro
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}

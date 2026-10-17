"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type {
	Measurement,
	MeasurementKey,
} from "~/domains/measurements/types/measurement-types";
import {
	fieldOf,
	formatDate,
	formatShortDate,
	MEASUREMENT_FIELDS,
	seriesOf,
} from "~/domains/measurements/utils/measurements";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "~/shared/components/ui/chart";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface EvolutionChartProps {
	measurements: Measurement[];
	selected: MeasurementKey;
	onSelect: (key: MeasurementKey) => void;
}

// Uma série por vez (a medida escolhida): sem legenda, o título diz o que é.
// Linha de 2px, pontos com anel na cor da superfície, grade discreta e
// tooltip com crosshair. O histórico abaixo é a versão em tabela.
/** "YYYY-MM-DD" → ms (UTC, só pra posição no eixo). */
function isoToTime(isoDate: string) {
	const [year, month, day] = isoDate.split("-").map(Number);
	return Date.UTC(year, month - 1, day);
}

function timeToIso(time: number) {
	return new Date(time).toISOString().slice(0, 10);
}

export function EvolutionChart({
	measurements,
	selected,
	onSelect,
}: EvolutionChartProps) {
	const field = fieldOf(selected);
	// Eixo X em tempo real (ms): a distância entre pontos acompanha a distância
	// entre as datas (jan→mar/25 não ocupa o mesmo espaço que mar/25→jan/26).
	const data = seriesOf(measurements, selected).map((point) => ({
		...point,
		time: isoToTime(point.date),
	}));
	const available = MEASUREMENT_FIELDS.filter(
		(f) => seriesOf(measurements, f.key).length > 0,
	);
	const config = {
		value: { label: field.label, color: "var(--primary)" },
	} satisfies ChartConfig;

	return (
		<section
			aria-label="Evolução"
			className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex flex-col gap-1">
				<h2 className="font-heading font-semibold">
					Evolução · {field.label} ({field.unit})
				</h2>
				<p className="text-muted-foreground text-xs">
					Escolha a medida pra ver como ela mudou ao longo do tempo.
				</p>
			</div>

			<div
				role="tablist"
				aria-label="Medida no gráfico"
				className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
			>
				{available.map((f) => (
					<button
						key={f.key}
						type="button"
						role="tab"
						aria-selected={f.key === selected}
						onClick={() => onSelect(f.key)}
						className={cn(
							"shrink-0 rounded-full px-3 py-1.5 font-medium text-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
							f.key === selected
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground hover:text-foreground",
						)}
					>
						{f.short}
					</button>
				))}
			</div>

			{data.length < 2 ? (
				<p className="py-10 text-center text-muted-foreground text-sm">
					{data.length === 0
						? "Ainda não há valores dessa medida."
						: "Com duas medições ou mais, o gráfico mostra a evolução."}
				</p>
			) : (
				<ChartContainer config={config} className="aspect-auto h-56 w-full">
					<LineChart
						data={data}
						margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid vertical={false} stroke="var(--border)" />
						<XAxis
							dataKey="time"
							type="number"
							scale="time"
							domain={["dataMin", "dataMax"]}
							tickFormatter={(time: number) => formatShortDate(timeToIso(time))}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							padding={{ left: 12, right: 12 }}
						/>
						<YAxis
							domain={["dataMin - 2", "dataMax + 2"]}
							tickFormatter={(value: number) => formatNumber(value)}
							tickLine={false}
							axisLine={false}
							width={32}
							allowDecimals={false}
						/>
						<ChartTooltip
							cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value, _name, item) => (
										// Data + valor juntos: com uma série só, o shadcn aninha
										// o rótulo no item e o formatter o substituiria.
										<div className="flex flex-col gap-0.5">
											<span className="text-muted-foreground">
												{formatDate(String(item.payload?.date ?? ""))}
											</span>
											<span className="font-heading font-semibold text-foreground tabular-nums">
												{formatNumber(Number(value), 1)} {field.unit}
											</span>
										</div>
									)}
								/>
							}
						/>
						<Line
							dataKey="value"
							type="monotone"
							stroke="var(--color-value)"
							strokeWidth={2}
							strokeLinecap="round"
							dot={{
								r: 4,
								fill: "var(--color-value)",
								stroke: "var(--card)",
								strokeWidth: 2,
							}}
							activeDot={{
								r: 6,
								fill: "var(--color-value)",
								stroke: "var(--card)",
								strokeWidth: 2,
							}}
							isAnimationActive={false}
						/>
					</LineChart>
				</ChartContainer>
			)}
		</section>
	);
}

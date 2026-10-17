"use client";

import type { Measurement } from "~/domains/measurements/types/measurement-types";
import {
	formatDate,
	MEASUREMENT_FIELDS,
} from "~/domains/measurements/utils/measurements";
import { formatNumber } from "~/shared/lib/format";

interface MeasurementHistoryProps {
	measurements: Measurement[];
	onEdit: (measurement: Measurement) => void;
}

const value = (v: number | null) => (v === null ? "—" : formatNumber(v, 1));

// Histórico no formato da planilha (desktop: tabela com rolagem lateral e a
// data fixa; celular: um card por medição). Tocar abre a edição.
export function MeasurementHistory({
	measurements,
	onEdit,
}: MeasurementHistoryProps) {
	return (
		<section aria-label="Histórico" className="flex flex-col gap-3">
			<h2 className="font-heading font-semibold text-lg">Histórico</h2>

			<div className="hidden overflow-x-auto rounded-3xl bg-card [scrollbar-width:thin] md:block">
				<table className="w-full text-sm tabular-nums">
					<thead>
						<tr className="text-muted-foreground text-xs">
							<th className="sticky left-0 bg-card px-4 py-3 text-left font-normal">
								Data
							</th>
							{MEASUREMENT_FIELDS.map((field) => (
								<th
									key={field.key}
									className="whitespace-nowrap px-3 py-3 text-right font-normal"
								>
									{field.short}
									<span className="ml-0.5 text-muted-foreground/70">
										{field.unit}
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{measurements.map((m) => (
							<tr
								key={m.id}
								onClick={() => onEdit(m)}
								className="cursor-pointer border-border border-t transition-colors hover:bg-accent"
							>
								<td className="sticky left-0 bg-card px-4 py-2.5">
									<button
										type="button"
										className="font-medium outline-none focus-visible:underline"
										onClick={(event) => {
											event.stopPropagation();
											onEdit(m);
										}}
									>
										{formatDate(m.measuredOn)}
									</button>
								</td>
								{MEASUREMENT_FIELDS.map((field) => (
									<td
										key={field.key}
										className={
											field.key === "weightKg"
												? "px-3 py-2.5 text-right font-medium"
												: "px-3 py-2.5 text-right"
										}
									>
										{value(m[field.key])}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ul className="flex flex-col gap-2 md:hidden">
				{measurements.map((m) => {
					const filled = MEASUREMENT_FIELDS.filter(
						(f) => f.key !== "weightKg" && m[f.key] !== null,
					);
					return (
						<li key={m.id}>
							<button
								type="button"
								onClick={() => onEdit(m)}
								className="flex w-full flex-col gap-2 rounded-3xl bg-card p-4 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								<span className="flex items-baseline justify-between">
									<span className="font-medium">
										{formatDate(m.measuredOn)}
									</span>
									{m.weightKg !== null && (
										<span className="font-heading font-semibold tabular-nums">
											{formatNumber(m.weightKg, 1)} kg
										</span>
									)}
								</span>
								<span className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs tabular-nums">
									{filled.map((f) => (
										<span key={f.key} className="flex justify-between gap-2">
											<span className="text-muted-foreground">{f.short}</span>
											<span>{value(m[f.key])}</span>
										</span>
									))}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

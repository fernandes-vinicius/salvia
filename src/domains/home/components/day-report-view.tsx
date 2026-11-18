import { PrintFooter } from "~/domains/diet/components/print-footer";
import { itemMacros } from "~/domains/diet/utils/diet";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { householdHint } from "~/domains/food/utils/household";
import {
	countedProtein,
	PROTEIN_LABELS,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import type { DayReport, DayReportMeal } from "~/domains/home/utils/day-report";
import type { SupplementMealRef } from "~/domains/supplements/types/supplement-types";
import {
	doseLabel,
	timingLabel,
} from "~/domains/supplements/utils/supplements";
import { waterAmountLabel } from "~/domains/water/utils/water-log";
import { Check, Minus, XIcon } from "~/shared/components/icons";
import { formatNonZero, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface DayReportViewProps {
	report: DayReport;
	proteinCounting: ProteinCounting;
	/** Meta do dia (sem TMB/Meta, o relatório mostra só o planejado). */
	targets: { protein: number; carbs: number; fat: number; kcal: number } | null;
	supplementMeals: SupplementMealRef[];
}

const STATUS = {
	done: {
		label: "Comi",
		icon: Check,
		className: "bg-primary text-primary-foreground",
	},
	skipped: {
		label: "Furei",
		icon: XIcon,
		className: "bg-destructive/15 text-destructive",
	},
	none: {
		label: "Não marcou",
		icon: Minus,
		className: "bg-muted text-muted-foreground",
	},
} as const;

// Relatório de um dia do diário: o que foi marcado (refeições, água,
// suplementos, pesagem) e o plano da dieta. Serve na tela e no PDF.
export function DayReportView({
	report,
	proteinCounting,
	targets,
	supplementMeals,
}: DayReportViewProps) {
	const proteinColumn = PROTEIN_LABELS[proteinCounting].column;
	const { water } = report;

	return (
		<div className="flex flex-col gap-6 print:gap-4">
			<dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
				<Stat
					label="Refeições"
					value={`${report.followed} de ${report.mealCount}`}
					hint={
						report.complete
							? "Dia completo"
							: report.followed > 0
								? "Parte do dia"
								: "Nada marcado"
					}
				/>
				<Stat
					label="Água"
					value={waterAmountLabel(water.ml)}
					hint={
						water.targetMl
							? `de ${waterAmountLabel(water.targetMl)} (${water.percent}%)`
							: "sem meta"
					}
				/>
				<Stat
					label="Suplementos"
					value={
						report.supplements.length > 0
							? `${report.takenCount} de ${report.supplements.length}`
							: "—"
					}
					hint={report.supplements.length > 0 ? "tomados" : "nenhum no dia"}
				/>
				<Stat
					label="Pesagem"
					value={
						report.weightKg === null
							? "—"
							: `${formatNumber(report.weightKg, 1)} kg`
					}
					hint={report.weightKg === null ? "sem pesagem" : "nesse dia"}
				/>
			</dl>

			<section aria-labelledby="report-meals" className="flex flex-col gap-3">
				<div className="flex flex-col gap-0.5">
					<h2 id="report-meals" className="font-heading font-semibold text-lg">
						Refeições
					</h2>
					<p className="text-muted-foreground text-sm">
						Alimentos e quantidades da sua dieta atual; a marcação é a desse
						dia.
					</p>
				</div>
				{report.meals.length === 0 ? (
					<p className="rounded-3xl bg-card p-4 text-muted-foreground text-sm">
						Sua dieta ainda não tem alimentos.
					</p>
				) : (
					<ul className="flex flex-col gap-3">
						{report.meals.map((meal) => (
							<li key={meal.id}>
								<MealBlock meal={meal} proteinCounting={proteinCounting} />
							</li>
						))}
					</ul>
				)}

				{report.meals.length > 0 && (
					<div className="overflow-x-auto rounded-3xl bg-card p-4 print:break-inside-avoid print:p-0">
						<table className="w-full min-w-72 text-sm tabular-nums">
							<thead>
								<tr className="text-right text-muted-foreground">
									<th scope="col" className="pb-1.5 text-left font-medium">
										<span className="sr-only">Linha</span>
									</th>
									<th
										scope="col"
										className="w-12 pb-1.5 font-medium text-macro-protein-ink"
									>
										{proteinColumn}
									</th>
									<th
										scope="col"
										className="w-12 pb-1.5 font-medium text-macro-carb-ink"
									>
										C
									</th>
									<th
										scope="col"
										className="w-12 pb-1.5 font-medium text-macro-fat-ink"
									>
										G
									</th>
									<th scope="col" className="w-16 pb-1.5 font-medium">
										kcal
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-border border-t text-right font-semibold">
									<th scope="row" className="py-2 text-left">
										Planejado
									</th>
									<td>{formatNumber(report.totals.protein)}</td>
									<td>{formatNumber(report.totals.carbs)}</td>
									<td>{formatNumber(report.totals.fat)}</td>
									<td>{formatNumber(report.totals.kcal)}</td>
								</tr>
								{targets && (
									<tr className="text-right text-muted-foreground">
										<th scope="row" className="py-1 text-left font-normal">
											Meta do dia
										</th>
										<td>{formatNumber(targets.protein)}</td>
										<td>{formatNumber(targets.carbs)}</td>
										<td>{formatNumber(targets.fat)}</td>
										<td>{formatNumber(targets.kcal)}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
				<section
					aria-labelledby="report-water"
					className="flex flex-col gap-2 rounded-3xl bg-card p-4 print:break-inside-avoid print:p-0"
				>
					<h2 id="report-water" className="font-heading font-semibold">
						Água
					</h2>
					<p className="text-sm tabular-nums">
						{waterAmountLabel(water.ml)}
						{water.targetMl &&
							` de ${waterAmountLabel(water.targetMl)} recomendados`}
					</p>
					{water.entries.length > 0 && (
						<p className="text-muted-foreground text-xs tabular-nums">
							Registros:{" "}
							{water.entries
								.map(
									(ml) =>
										`${ml > 0 ? "+" : "−"}${waterAmountLabel(Math.abs(ml))}`,
								)
								.join(", ")}
						</p>
					)}
				</section>

				<section
					aria-labelledby="report-supplements"
					className="flex flex-col gap-2 rounded-3xl bg-card p-4 print:break-inside-avoid print:p-0"
				>
					<h2 id="report-supplements" className="font-heading font-semibold">
						Suplementos
					</h2>
					{report.supplements.length === 0 ? (
						<p className="text-muted-foreground text-sm">Nenhum nesse dia.</p>
					) : (
						<ul className="flex flex-col gap-1 text-sm">
							{report.supplements.map((supplement) => (
								<li key={supplement.id}>
									<span className="font-medium">{supplement.name}</span>{" "}
									<span className="text-muted-foreground tabular-nums">
										{doseLabel(supplement.dose, supplement.unit)} ·{" "}
										{timingLabel(supplement, supplementMeals)}
									</span>{" "}
									·{" "}
									<span
										className={cn(
											"font-medium",
											supplement.taken
												? "text-primary"
												: "text-muted-foreground",
										)}
									>
										{supplement.taken ? "tomou" : "não marcou"}
									</span>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>

			<PrintFooter />
		</div>
	);
}

function Stat({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint: string;
}) {
	return (
		<div className="flex flex-col gap-0.5 rounded-3xl bg-card p-4 print:rounded-xl print:bg-muted print:p-3">
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="font-heading font-semibold text-xl tabular-nums">
				{value}
			</dd>
			<dd className="text-muted-foreground text-xs tabular-nums">{hint}</dd>
		</div>
	);
}

function MealBlock({
	meal,
	proteinCounting,
}: {
	meal: DayReportMeal;
	proteinCounting: ProteinCounting;
}) {
	const status = STATUS[meal.status ?? "none"];
	return (
		<article className="flex flex-col gap-2 rounded-3xl bg-card p-4 print:break-inside-avoid print:rounded-none print:border-border print:border-t print:p-0 print:pt-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h3 className="font-medium">
					{meal.name}
					{meal.time && (
						<span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
							{meal.time}
						</span>
					)}
				</h3>
				<span
					className={cn(
						"flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium text-xs",
						status.className,
					)}
				>
					<status.icon className="size-3.5" aria-hidden />
					{status.label}
				</span>
			</div>
			<div
				aria-hidden
				className="flex justify-end text-muted-foreground text-xs"
			>
				<MacroCells
					protein={PROTEIN_LABELS[proteinCounting].column}
					carbs="C"
					fat="G"
				/>
			</div>
			<ul className="flex flex-col gap-1 text-sm">
				{meal.items.map((item) => {
					const macros = itemMacros(item);
					const hint = householdHint(item.food, item.quantity);
					return (
						<li
							key={item.id}
							className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3"
						>
							<span className="min-w-0">
								{item.food.name}{" "}
								<span className="text-muted-foreground tabular-nums">
									{formatNumber(item.quantity, 1)}{" "}
									{UNIT_LABELS[item.food.unit].short}
									{hint && ` · ${hint.short}`}
								</span>
							</span>
							<MacroCells
								protein={formatNonZero(countedProtein(macros, proteinCounting))}
								carbs={formatNonZero(macros.carbs)}
								fat={formatNonZero(macros.fat)}
							/>
						</li>
					);
				})}
			</ul>
			<p className="text-right text-muted-foreground text-xs tabular-nums">
				{formatNumber(meal.kcal)} kcal
			</p>
		</article>
	);
}

/** P · C · G em colunas de largura fixa (célula vazia mantém o alinhamento). */
function MacroCells({
	protein,
	carbs,
	fat,
}: {
	protein: string;
	carbs: string;
	fat: string;
}) {
	return (
		<span className="flex shrink-0 text-right text-xs tabular-nums">
			<span className="w-9 text-macro-protein-ink">{protein}</span>
			<span className="w-9 text-macro-carb-ink">{carbs}</span>
			<span className="w-9 text-macro-fat-ink">{fat}</span>
		</span>
	);
}

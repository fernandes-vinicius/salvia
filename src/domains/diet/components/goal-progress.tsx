import type { DietSummary } from "~/domains/diet/types/diet-types";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface GoalProgressProps {
	summary: DietSummary;
	targets: GoalTargets;
}

/** Até ±3% da meta conta como "na meta". */
const TOLERANCE = 0.03;

function diffLabel(planned: number, target: number, unit: string) {
	const diff = planned - target;
	if (target > 0 && Math.abs(diff) <= target * TOLERANCE) return "Na meta";
	return diff < 0
		? `Faltam ${formatNumber(-diff)} ${unit}`
		: `+${formatNumber(diff)} ${unit} acima`;
}

// Planejado × meta (a parte "Protein e Carb / Kg" da planilha), com proteína
// animal como na meta.
export function GoalProgress({ summary, targets }: GoalProgressProps) {
	const rows = [
		{
			label: "Calorias",
			planned: summary.kcal,
			target: targets.calories,
			unit: "kcal",
			bar: "bg-primary",
		},
		{
			label: "Proteína animal",
			planned: summary.lines.proteinAnimal.grams,
			target: targets.protein.grams,
			unit: "g",
			bar: "bg-macro-protein",
		},
		{
			label: "Carboidrato",
			planned: summary.lines.carbs.grams,
			target: targets.carbs.grams,
			unit: "g",
			bar: "bg-macro-carb",
		},
		{
			label: "Gordura",
			planned: summary.lines.fat.grams,
			target: targets.fat.grams,
			unit: "g",
			bar: "bg-macro-fat",
		},
	];

	return (
		<section
			aria-label="Planejado × meta"
			className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="font-heading font-semibold">Planejado × meta</h2>
			<ul className="flex flex-col gap-4">
				{rows.map((row) => {
					const ratio = row.target > 0 ? row.planned / row.target : 0;
					return (
						<li key={row.label} className="flex flex-col gap-1.5">
							<div className="flex items-baseline justify-between gap-3 text-sm">
								<span>{row.label}</span>
								<span className="tabular-nums">
									<span className="font-medium">
										{formatNumber(row.planned)}
									</span>
									<span className="text-muted-foreground">
										{" "}
										/ {formatNumber(row.target)} {row.unit}
									</span>
								</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-muted">
								<div
									className={cn(
										"h-full rounded-full transition-[width]",
										row.bar,
									)}
									style={{ width: `${Math.min(100, ratio * 100)}%` }}
								/>
							</div>
							<span className="text-muted-foreground text-xs tabular-nums">
								{diffLabel(row.planned, row.target, row.unit)}
							</span>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

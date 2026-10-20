import type { DietSummary } from "~/domains/diet/types/diet-types";
import { summaryProtein } from "~/domains/diet/utils/diet";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import {
	PROTEIN_LABELS,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import { ChevronDown } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface DietSummaryCompactProps {
	summary: DietSummary;
	targets: GoalTargets | null;
	proteinCounting: ProteinCounting;
	/** Resumo do dia e Planejado × meta abertos embaixo. */
	expanded: boolean;
	onToggle: () => void;
}

// Celular: o resumo e a meta ocupavam a primeira tela inteira. Esta faixa
// mostra o essencial (kcal e macros × meta) e abre o resto num toque, pra
// grade de refeições aparecer antes.
export function DietSummaryCompact({
	summary,
	targets,
	proteinCounting,
	expanded,
	onToggle,
}: DietSummaryCompactProps) {
	const cells = [
		{
			label: "kcal",
			planned: summary.kcal,
			target: targets?.calories ?? null,
			unit: "",
			bar: "bg-primary",
		},
		{
			label: PROTEIN_LABELS[proteinCounting].column,
			planned: summaryProtein(summary, proteinCounting),
			target: targets?.protein.grams ?? null,
			unit: " g",
			bar: "bg-macro-protein",
		},
		{
			label: "C",
			planned: summary.lines.carbs.grams,
			target: targets?.carbs.grams ?? null,
			unit: " g",
			bar: "bg-macro-carb",
		},
		{
			label: "G",
			planned: summary.lines.fat.grams,
			target: targets?.fat.grams ?? null,
			unit: " g",
			bar: "bg-macro-fat",
		},
	];

	return (
		<section
			aria-label="Resumo rápido do dia"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4"
		>
			<dl className="grid grid-cols-2 gap-x-4 gap-y-3 min-[22rem]:grid-cols-4">
				{cells.map((cell) => (
					<div key={cell.label} className="flex min-w-0 flex-col gap-1">
						<dt className="text-muted-foreground text-xs">{cell.label}</dt>
						<dd className="flex flex-col font-heading tabular-nums">
							<span className="font-semibold">
								{formatNumber(cell.planned)}
							</span>
							{cell.target !== null && (
								<span className="text-muted-foreground text-xs">
									/ {formatNumber(cell.target)}
									{cell.unit}
								</span>
							)}
						</dd>
						{cell.target !== null && (
							<div className="h-1.5 overflow-hidden rounded-full bg-muted">
								<div
									className={cn("h-full rounded-full", cell.bar)}
									style={{
										width: `${Math.min(100, cell.target > 0 ? (cell.planned / cell.target) * 100 : 0)}%`,
									}}
								/>
							</div>
						)}
					</div>
				))}
			</dl>
			<button
				type="button"
				aria-expanded={expanded}
				onClick={onToggle}
				className="flex items-center justify-center gap-1.5 rounded-2xl py-1.5 font-medium text-primary text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				{expanded ? "Fechar resumo completo" : "Ver resumo completo"}
				<ChevronDown
					className={cn(
						"size-4 transition-transform",
						expanded && "rotate-180",
					)}
					aria-hidden
				/>
			</button>
		</section>
	);
}

import Link from "next/link";

import type { DietSummary } from "~/domains/diet/types/diet-types";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import { planVerdict } from "~/domains/home/utils/home";
import { ArrowRight } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface PlanOverviewProps {
	summary: DietSummary;
	targets: GoalTargets;
}

// Card principal: o plano da aba Dieta comparado com a meta, em um olhar.
export function PlanOverview({ summary, targets }: PlanOverviewProps) {
	const verdict = planVerdict(summary, targets);
	const ratio = targets.calories > 0 ? summary.kcal / targets.calories : 0;
	const macros = [
		{
			label: "Proteína animal",
			planned: summary.lines.proteinAnimal.grams,
			target: targets.protein.grams,
			// Sobre o fundo `primary`, a cor de proteína (sálvia) sumiria.
			bar: "bg-primary-foreground",
		},
		{
			label: "Carboidrato",
			planned: summary.lines.carbs.grams,
			target: targets.carbs.grams,
			bar: "bg-macro-carb",
		},
		{
			label: "Gordura",
			planned: summary.lines.fat.grams,
			target: targets.fat.grams,
			bar: "bg-macro-fat",
		},
	];

	return (
		<section
			aria-label="Plano × meta"
			className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground md:p-5"
		>
			<div className="flex items-center justify-between gap-2">
				<p className="text-sm opacity-80">Seu plano do dia</p>
				<Link
					href="/dieta"
					className="flex items-center gap-1 font-medium text-xs opacity-90 hover:opacity-100"
				>
					Ver dieta
					<ArrowRight className="size-3.5" />
				</Link>
			</div>

			<div className="flex flex-col gap-2">
				<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
					{formatNumber(summary.kcal)}
					<span className="ml-1.5 font-normal text-lg opacity-80">
						/ {formatNumber(targets.calories)} kcal
					</span>
				</p>
				<div className="h-2.5 overflow-hidden rounded-full bg-primary-foreground/15">
					<div
						className="h-full rounded-full bg-primary-foreground transition-[width]"
						style={{ width: `${Math.min(100, ratio * 100)}%` }}
					/>
				</div>
				<p
					className={cn(
						"text-sm",
						verdict.status === "on-target" ? "font-medium" : "opacity-90",
					)}
				>
					{verdict.message}
				</p>
			</div>

			<ul className="grid gap-3 rounded-2xl bg-primary-foreground/10 p-4 sm:grid-cols-3">
				{macros.map((macro) => {
					const macroRatio =
						macro.target > 0 ? macro.planned / macro.target : 0;
					return (
						<li key={macro.label} className="flex flex-col gap-1.5">
							<div className="flex items-baseline justify-between gap-2 text-sm">
								<span className="opacity-90">{macro.label}</span>
								<span className="tabular-nums">
									<span className="font-heading font-semibold">
										{formatNumber(macro.planned)}
									</span>
									<span className="text-xs opacity-70">
										/{formatNumber(macro.target)} g
									</span>
								</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-primary-foreground/15">
								<div
									className={cn("h-full rounded-full", macro.bar)}
									style={{ width: `${Math.min(100, macroRatio * 100)}%` }}
								/>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

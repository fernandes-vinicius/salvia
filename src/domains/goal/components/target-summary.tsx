import type { GoalTargets } from "~/domains/goal/types/goal-types";
import { SaveStatus } from "~/shared/components/save-status";
import type { AutosaveStatus } from "~/shared/hooks/use-autosave";
import { formatFixed, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface TargetSummaryProps {
	targets: GoalTargets;
	tdee: number;
	calorieAdjustment: number;
	status: AutosaveStatus;
	isExample: boolean;
	className?: string;
}

function formatAdjustment(adjustment: number) {
	if (adjustment === 0) return "sem ajuste";
	const sign = adjustment > 0 ? "+" : "−";
	return `${sign} ${formatNumber(Math.abs(adjustment))}`;
}

export function TargetSummary({
	targets,
	tdee,
	calorieAdjustment,
	status,
	isExample,
	className,
}: TargetSummaryProps) {
	const macros = [
		{
			label: "Proteína animal",
			target: targets.protein,
			// Sobre o fundo `primary`, a cor de proteína (sálvia) sumiria.
			swatch: "bg-primary-foreground",
		},
		{ label: "Carboidrato", target: targets.carbs, swatch: "bg-macro-carb" },
		{ label: "Gordura", target: targets.fat, swatch: "bg-macro-fat" },
	];
	const totalKcal = macros.reduce((sum, m) => sum + m.target.kcal, 0) || 1;

	return (
		<section
			aria-label="Sua meta diária"
			className={cn(
				"flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:p-5",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<p className="text-sm opacity-80">Meta diária</p>
				<SaveStatus status={status} isExample={isExample} />
			</div>

			<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
				{formatNumber(targets.calories)}
				<span className="ml-1.5 font-normal text-lg opacity-80">kcal</span>
			</p>
			<p className="text-sm opacity-80">
				Gasto {formatNumber(tdee)} {formatAdjustment(calorieAdjustment)}
			</p>

			<div
				aria-hidden
				className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full"
			>
				{macros.map((macro) => (
					<div
						key={macro.label}
						className={cn("h-full transition-[flex-grow]", macro.swatch)}
						style={{ flexGrow: macro.target.kcal / totalKcal }}
					/>
				))}
			</div>

			<dl className="mt-3 flex flex-col divide-y divide-primary-foreground/15 rounded-2xl bg-primary-foreground/10 px-4">
				{macros.map((macro) => (
					<div
						key={macro.label}
						className="flex items-center justify-between gap-4 py-2.5"
					>
						<dt className="flex shrink-0 items-center gap-2 text-sm opacity-90">
							<span className={cn("size-2 rounded-full", macro.swatch)} />
							{macro.label}
						</dt>
						<dd className="text-right">
							<span className="font-heading font-semibold tabular-nums">
								{formatNumber(macro.target.grams)} g
							</span>
							<span className="ml-1.5 text-xs tabular-nums opacity-70">
								{formatFixed(macro.target.perKg)} g/kg
							</span>
						</dd>
					</div>
				))}
			</dl>

			{/* Só com carboidrato manual: a soma dos macros pode não fechar com
			    a meta (o "Excedente" da planilha). */}
			{Math.abs(targets.calorieGap) >= 1 && (
				<p className="mt-2 text-xs opacity-90">
					Seus macros somam{" "}
					<span className="font-semibold tabular-nums">
						{formatNumber(targets.macroCalories)} kcal
					</span>{" "}
					· {formatNumber(Math.abs(targets.calorieGap))}{" "}
					{targets.calorieGap < 0 ? "abaixo" : "acima"} da meta
				</p>
			)}

			{isExample && (
				<p className="mt-2 text-xs opacity-80">
					Meta de exemplo. Escolha seu objetivo: salvamos sozinhos a cada
					mudança.
				</p>
			)}
		</section>
	);
}

"use client";

import { useState } from "react";

import type { Goal, GoalTargets } from "~/domains/goal/types/goal-types";
import { MACRO_RANGES } from "~/domains/goal/utils/goal";
import {
	ChevronDown,
	Droplet,
	Drumstick,
	SlidersHorizontal,
	Wheat,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { formatFixed, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface MacroTargetsProps {
	goal: Goal;
	targets: GoalTargets;
	onChange: (macros: Pick<Goal, "proteinPerKg" | "fatPerKg">) => void;
}

export function MacroTargets({ goal, targets, onChange }: MacroTargetsProps) {
	const [isAdjusting, setIsAdjusting] = useState(false);

	const rows = [
		{
			label: "Proteína animal",
			hint: `${formatFixed(goal.proteinPerKg)} g por kg de peso`,
			grams: targets.protein.grams,
			dot: "bg-macro-protein",
		},
		{
			label: "Gordura",
			hint: `${formatFixed(goal.fatPerKg)} g por kg de peso`,
			grams: targets.fat.grams,
			dot: "bg-macro-fat",
		},
		{
			label: "Carboidrato",
			hint: `O que sobra das calorias · ${formatFixed(targets.carbs.perKg)} g/kg`,
			grams: targets.carbs.grams,
			dot: "bg-macro-carb",
		},
	];

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col divide-y divide-border rounded-2xl bg-card px-4">
				{rows.map((row) => (
					<div key={row.label} className="flex items-center gap-3 py-3">
						<span className={cn("size-2.5 shrink-0 rounded-full", row.dot)} />
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="font-medium text-sm">{row.label}</span>
							<span className="text-muted-foreground text-xs">{row.hint}</span>
						</span>
						<span className="font-heading font-semibold tabular-nums">
							{formatNumber(row.grams)} g
						</span>
					</div>
				))}
			</div>

			<button
				type="button"
				aria-expanded={isAdjusting}
				onClick={() => setIsAdjusting((open) => !open)}
				className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 font-medium text-primary text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				<span className="flex items-center gap-2">
					<SlidersHorizontal className="size-4" />
					Ajustar macros
				</span>
				<ChevronDown
					className={cn(
						"size-4 transition-transform",
						isAdjusting && "rotate-180",
					)}
				/>
			</button>

			{isAdjusting && (
				<div className="flex flex-col gap-3">
					<MeasureSlider
						label="Proteína animal"
						icon={Drumstick}
						unit="g/kg"
						value={goal.proteinPerKg}
						{...MACRO_RANGES.proteinPerKg}
						fractionDigits={1}
						fixedDigits
						caption={`= ${formatNumber(targets.protein.grams)} g por dia`}
						onValueChange={(proteinPerKg) =>
							onChange({ proteinPerKg, fatPerKg: goal.fatPerKg })
						}
					/>
					<MeasureSlider
						label="Gordura"
						icon={Droplet}
						unit="g/kg"
						value={goal.fatPerKg}
						{...MACRO_RANGES.fatPerKg}
						fractionDigits={1}
						fixedDigits
						caption={`= ${formatNumber(targets.fat.grams)} g por dia`}
						onValueChange={(fatPerKg) =>
							onChange({ proteinPerKg: goal.proteinPerKg, fatPerKg })
						}
					/>
					<p className="flex items-start gap-2 px-1 text-muted-foreground text-xs">
						<Wheat className="mt-0.5 size-3.5 shrink-0" />
						<span>
							Proteína animal: carnes, ovos, laticínios e whey. A vegetal
							(feijão, grãos, pão) entra nas calorias, mas não conta para essa
							meta. O carboidrato se ajusta sozinho com o que sobrar.
						</span>
					</p>
				</div>
			)}
		</div>
	);
}

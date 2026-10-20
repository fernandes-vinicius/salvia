"use client";

import { useState } from "react";
import type { Goal, GoalTargets } from "~/domains/goal/types/goal-types";
import { MACRO_RANGES } from "~/domains/goal/utils/goal";
import {
	DEFAULT_PROTEIN_COUNTING,
	PROTEIN_LABELS,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import {
	ChevronDown,
	Droplet,
	Drumstick,
	SlidersHorizontal,
	Wheat,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { SwitchCard } from "~/shared/components/switch-card";
import { formatFixed, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

type MacroFields = Pick<Goal, "proteinPerKg" | "fatPerKg" | "carbsPerKg">;

interface MacroTargetsProps {
	goal: Goal;
	targets: GoalTargets;
	onChange: (macros: Partial<MacroFields>) => void;
	/** Proteína total (padrão, também sem sessão) ou só animal. */
	proteinCounting?: ProteinCounting;
}

/** Arredonda pro passo do slider (0,1 g/kg) e mantém dentro da faixa. */
function roundToStep(perKg: number) {
	const { min, max } = MACRO_RANGES.carbsPerKg;
	return Math.min(max, Math.max(min, Math.round(perKg * 10) / 10));
}

export function MacroTargets({
	goal,
	targets,
	onChange,
	proteinCounting = DEFAULT_PROTEIN_COUNTING,
}: MacroTargetsProps) {
	const protein = PROTEIN_LABELS[proteinCounting];
	const [isAdjusting, setIsAdjusting] = useState(false);
	const isCarbsAuto = goal.carbsPerKg === null;

	const rows = [
		{
			label: protein.title,
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
			hint: isCarbsAuto
				? `O que sobra das calorias · ${formatFixed(targets.carbs.perKg)} g/kg`
				: `${formatFixed(targets.carbs.perKg)} g por kg de peso · definido por você`,
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
						label={protein.title}
						icon={Drumstick}
						unit="g/kg"
						value={goal.proteinPerKg}
						{...MACRO_RANGES.proteinPerKg}
						fractionDigits={1}
						fixedDigits
						caption={`= ${formatNumber(targets.protein.grams)} g por dia`}
						onValueChange={(proteinPerKg) => onChange({ proteinPerKg })}
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
						onValueChange={(fatPerKg) => onChange({ fatPerKg })}
					/>

					{/* Carboidrato: automático (o que sobra) por padrão; desligando,
					    vira g/kg fixo como na planilha. Começa no valor que o
					    automático estava dando, pra não dar salto. */}
					<SwitchCard
						icon={Wheat}
						title="Carboidrato automático"
						description={
							isCarbsAuto
								? "Ajusta sozinho com o que sobrar das calorias."
								: "Desligado: você escolhe os g/kg abaixo."
						}
						checked={isCarbsAuto}
						onCheckedChange={(auto) =>
							onChange({
								carbsPerKg: auto ? null : roundToStep(targets.carbs.perKg),
							})
						}
					/>
					{!isCarbsAuto && (
						<MeasureSlider
							label="Carboidrato"
							icon={Wheat}
							unit="g/kg"
							value={goal.carbsPerKg ?? 0}
							{...MACRO_RANGES.carbsPerKg}
							fractionDigits={1}
							fixedDigits
							caption={`= ${formatNumber(targets.carbs.grams)} g por dia`}
							onValueChange={(carbsPerKg) => onChange({ carbsPerKg })}
						/>
					)}

					<p className="px-1 text-muted-foreground text-xs">{protein.hint}</p>
				</div>
			)}
		</div>
	);
}

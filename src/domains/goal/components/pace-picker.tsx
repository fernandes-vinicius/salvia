"use client";

import type { Objective } from "~/domains/goal/types/goal-types";
import {
	CUSTOM_ADJUSTMENT_RANGE,
	PACES,
	weeklyChangeKg,
} from "~/domains/goal/utils/goal";
import { ChoiceCard } from "~/shared/components/choice-card";
import {
	Flame,
	Footprints,
	type LucideIcon,
	SlidersHorizontal,
	Zap,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { RadioGroup } from "~/shared/components/ui/radio-group";
import { formatNumber } from "~/shared/lib/format";

const PACE_ICONS: Record<string, LucideIcon> = {
	Devagar: Footprints,
	Recomendado: Flame,
	Rápido: Zap,
};

const CUSTOM = "custom";

function describeWeekly(adjustment: number) {
	const kg = Math.abs(weeklyChangeKg(adjustment));
	return `~${formatNumber(kg, 2)} kg por semana`;
}

function formatKcal(adjustment: number) {
	const sign = adjustment > 0 ? "+" : "−";
	return `${sign}${formatNumber(Math.abs(adjustment))} kcal por dia`;
}

interface PacePickerProps {
	objective: Exclude<Objective, "maintain">;
	adjustment: number;
	isCustom: boolean;
	onPresetChange: (adjustment: number) => void;
	onCustomToggle: () => void;
	onCustomChange: (adjustment: number) => void;
}

// Ritmo em linguagem de leigo ("~0,5 kg por semana"); kcal só como dica.
// "Personalizado" libera um slider pra valor exato (ex.: −471 da planilha).
export function PacePicker({
	objective,
	adjustment,
	isCustom,
	onPresetChange,
	onCustomToggle,
	onCustomChange,
}: PacePickerProps) {
	const sign = objective === "lose" ? -1 : 1;
	const value = isCustom ? CUSTOM : String(adjustment);

	return (
		<div className="flex flex-col gap-3">
			<RadioGroup
				aria-label="Ritmo"
				value={value}
				onValueChange={(next) => {
					if (next === CUSTOM) onCustomToggle();
					else onPresetChange(Number(next));
				}}
				className="gap-2"
			>
				{PACES[objective].map((pace) => (
					<ChoiceCard
						key={pace.adjustment}
						value={String(pace.adjustment)}
						icon={PACE_ICONS[pace.label] ?? Flame}
						title={pace.label}
						description={describeWeekly(pace.adjustment)}
						hint={formatKcal(pace.adjustment)}
					/>
				))}
				<ChoiceCard
					value={CUSTOM}
					icon={SlidersHorizontal}
					title="Personalizado"
					description="Escolha o valor exato de calorias."
				/>
			</RadioGroup>

			{isCustom && (
				<MeasureSlider
					label={
						objective === "lose"
							? "Comer a menos por dia"
							: "Comer a mais por dia"
					}
					icon={SlidersHorizontal}
					unit="kcal"
					value={Math.abs(adjustment)}
					min={CUSTOM_ADJUSTMENT_RANGE.min}
					max={CUSTOM_ADJUSTMENT_RANGE.max}
					step={10}
					buttonStep={1}
					caption={describeWeekly(adjustment)}
					onValueChange={(next) => onCustomChange(sign * next)}
				/>
			)}
		</div>
	);
}

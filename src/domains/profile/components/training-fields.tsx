"use client";

import { OptionPicker } from "~/domains/profile/components/option-picker";
import type { TrainingRoutine } from "~/domains/profile/types/profile-types";
import {
	calculateTrainingKcalPerDay,
	type Option,
	TRAINING_RANGES,
} from "~/domains/profile/utils/energy";
import {
	CalendarDays,
	Flame,
	type LucideIcon,
	Signal,
	SignalHigh,
	SignalLow,
	SignalMedium,
	Timer,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { SwitchCard } from "~/shared/components/switch-card";
import { formatNumber } from "~/shared/lib/format";

// Sinal crescente; o último nível vira chama pra marcar o extremo.
const INTENSITY_ICONS = [SignalLow, SignalMedium, SignalHigh, Signal, Flame];

interface TrainingFieldsProps {
	/** Ex.: "Faz musculação?" */
	question: string;
	icon: LucideIcon;
	routine: TrainingRoutine;
	weightKg: number;
	minutesRange: { min: number; max: number; step: number };
	intensities: Option[];
	onChange: (routine: TrainingRoutine) => void;
}

export function TrainingFields({
	question,
	icon,
	routine,
	weightKg,
	minutesRange,
	intensities,
	onChange,
}: TrainingFieldsProps) {
	const kcalPerDay = calculateTrainingKcalPerDay(
		{ ...routine, enabled: true },
		weightKg,
	);

	return (
		<div className="flex flex-col gap-3">
			<SwitchCard
				icon={icon}
				title={question}
				description={
					routine.enabled
						? `≈ +${formatNumber(kcalPerDay)} kcal por dia, na média da semana`
						: "Não: não entra no seu gasto."
				}
				checked={routine.enabled}
				onCheckedChange={(enabled) => onChange({ ...routine, enabled })}
			/>

			{routine.enabled && (
				<>
					<MeasureSlider
						label="Dias por semana"
						icon={CalendarDays}
						unit={(days) => (days === 1 ? "dia" : "dias")}
						value={routine.daysPerWeek}
						{...TRAINING_RANGES.daysPerWeek}
						onValueChange={(daysPerWeek) =>
							onChange({ ...routine, daysPerWeek })
						}
					/>
					<MeasureSlider
						label="Duração de cada treino"
						icon={Timer}
						unit="min"
						value={routine.minutesPerSession}
						{...minutesRange}
						buttonStep={1}
						onValueChange={(minutesPerSession) =>
							onChange({ ...routine, minutesPerSession })
						}
					/>
					<p className="mt-1 px-1 font-medium text-sm">Intensidade</p>
					<OptionPicker
						label="Intensidade"
						options={intensities}
						value={routine.met}
						icons={INTENSITY_ICONS}
						onValueChange={(met) => onChange({ ...routine, met })}
					/>
				</>
			)}
		</div>
	);
}

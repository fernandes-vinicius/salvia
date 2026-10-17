"use client";

import { ChoiceCard } from "~/domains/profile/components/choice-card";
import { ACTIVITY_LEVELS } from "~/domains/profile/utils/energy";
import {
	Armchair,
	Bike,
	Dumbbell,
	Footprints,
	type LucideIcon,
	Zap,
} from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";
import { formatNumber } from "~/shared/lib/format";

const LEVEL_ICONS: Record<number, LucideIcon> = {
	1.2: Armchair,
	1.375: Footprints,
	1.55: Bike,
	1.725: Dumbbell,
	1.9: Zap,
};

interface ActivityLevelPickerProps {
	value: number;
	onValueChange: (factor: number) => void;
}

// O usuário escolhe a rotina que mais parece com a dele; o fator técnico
// (FA) só aparece discreto como dica, nunca é digitado.
export function ActivityLevelPicker({
	value,
	onValueChange,
}: ActivityLevelPickerProps) {
	return (
		<RadioGroup
			aria-label="Nível de atividade"
			value={String(value)}
			onValueChange={(next) => onValueChange(Number(next))}
			className="gap-2"
		>
			{ACTIVITY_LEVELS.map((level) => (
				<ChoiceCard
					key={level.factor}
					value={String(level.factor)}
					icon={LEVEL_ICONS[level.factor] ?? Footprints}
					title={level.label}
					description={level.description}
					hint={`Fator de atividade × ${formatNumber(level.factor, 3)}`}
				/>
			))}
		</RadioGroup>
	);
}

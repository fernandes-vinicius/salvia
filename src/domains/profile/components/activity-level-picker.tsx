"use client";

import { ACTIVITY_LEVELS } from "~/domains/profile/utils/energy";
import { ChoiceCard } from "~/shared/components/choice-card";
import {
	Dumbbell,
	Flame,
	Footprints,
	HardHat,
	Laptop,
	type LucideIcon,
	Sofa,
} from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";

const LEVEL_ICONS: Record<number, LucideIcon> = {
	1: Sofa,
	1.2: Laptop,
	1.375: Footprints,
	1.55: Dumbbell,
	1.725: HardHat,
	1.9: Flame,
};

// Sempre com ao menos 1 casa: "1,0", "1,2", "1,375".
function formatFactor(factor: number) {
	return factor.toLocaleString("pt-BR", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 3,
	});
}

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
					tags={level.tags}
					hint={`Fator de atividade × ${formatFactor(level.factor)}`}
				/>
			))}
		</RadioGroup>
	);
}

"use client";

import type { Objective } from "~/domains/goal/types/goal-types";
import { OBJECTIVES } from "~/domains/goal/utils/goal";
import { ChoiceCard } from "~/shared/components/choice-card";
import {
	Equal,
	type LucideIcon,
	TrendingDown,
	TrendingUp,
} from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";

const OBJECTIVE_ICONS: Record<Objective, LucideIcon> = {
	lose: TrendingDown,
	maintain: Equal,
	gain: TrendingUp,
};

interface ObjectivePickerProps {
	value: Objective;
	onValueChange: (value: Objective) => void;
}

export function ObjectivePicker({
	value,
	onValueChange,
}: ObjectivePickerProps) {
	return (
		<RadioGroup
			aria-label="Objetivo"
			value={value}
			onValueChange={(next) => onValueChange(next as Objective)}
			className="gap-2"
		>
			{OBJECTIVES.map((objective) => (
				<ChoiceCard
					key={objective.value}
					value={objective.value}
					icon={OBJECTIVE_ICONS[objective.value]}
					title={objective.label}
					description={objective.description}
				/>
			))}
		</RadioGroup>
	);
}

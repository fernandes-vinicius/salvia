"use client";

import type { Sex } from "~/domains/profile/types/profile-types";
import { ChoiceCard } from "~/shared/components/choice-card";
import { Mars, Venus } from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";

interface SexPickerProps {
	value: Sex;
	onValueChange: (value: Sex) => void;
}

export function SexPicker({ value, onValueChange }: SexPickerProps) {
	return (
		<RadioGroup
			aria-label="Sexo biológico"
			value={value}
			onValueChange={(next) => onValueChange(next as Sex)}
			className="grid-cols-2"
		>
			<ChoiceCard value="male" icon={Mars} title="Masculino" hideIndicator />
			<ChoiceCard value="female" icon={Venus} title="Feminino" hideIndicator />
		</RadioGroup>
	);
}

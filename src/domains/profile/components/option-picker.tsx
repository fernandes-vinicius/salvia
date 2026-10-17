"use client";

import type { Option } from "~/domains/profile/utils/energy";
import { ChoiceCard } from "~/shared/components/choice-card";
import type { LucideIcon } from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";

interface OptionPickerProps {
	label: string;
	options: Option[];
	value: number;
	icons: LucideIcon[];
	/** Dica técnica discreta (ex.: "Fator × 1,15"); o usuário nunca digita. */
	formatHint?: (option: Option) => string;
	onValueChange: (value: number) => void;
}

// Lista de níveis descritivos (NEAT, intensidade de treino) em cards. Ícones
// seguem a ordem das opções.
export function OptionPicker({
	label,
	options,
	value,
	icons,
	formatHint,
	onValueChange,
}: OptionPickerProps) {
	return (
		<RadioGroup
			aria-label={label}
			value={String(value)}
			onValueChange={(next) => onValueChange(Number(next))}
			className="gap-2"
		>
			{options.map((option, index) => {
				const Icon = icons[index] ?? icons[0];
				return (
					<ChoiceCard
						key={option.value}
						value={String(option.value)}
						icon={Icon}
						title={option.label}
						description={option.description}
						tags={option.tags}
						hint={formatHint?.(option)}
					/>
				);
			})}
		</RadioGroup>
	);
}

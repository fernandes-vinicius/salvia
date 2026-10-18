"use client";

import { OptionPicker } from "~/domains/profile/components/option-picker";
import { SexPicker } from "~/domains/profile/components/sex-picker";
import { TrainingFields } from "~/domains/profile/components/training-fields";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	CARDIO_INTENSITIES,
	NEAT_LEVELS,
	STRENGTH_INTENSITIES,
	TRAINING_RANGES,
} from "~/domains/profile/utils/energy";
import { FormSection } from "~/shared/components/form-section";
import {
	Cake,
	Dumbbell,
	Footprints,
	HardHat,
	HeartPulse,
	Laptop,
	PersonStanding,
	Ruler,
	Sofa,
	Weight,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { formatFixed } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

const NEAT_ICONS = [Sofa, Laptop, PersonStanding, Footprints, HardHat];

interface ProfileFieldsProps {
	profile: BodyProfile;
	onChange: <K extends keyof BodyProfile>(
		key: K,
		value: BodyProfile[K],
	) => void;
	className?: string;
}

// Campos da TMB (corpo, dia a dia e treinos). Usados na aba TMB (com
// autosave) e na calculadora pública (só estado local).
export function ProfileFields({
	profile,
	onChange: update,
	className,
}: ProfileFieldsProps) {
	return (
		<div className={cn("flex flex-col gap-8", className)}>
			<FormSection
				title="Sobre você"
				description="A taxa em repouso muda conforme o sexo biológico e a idade."
			>
				<SexPicker
					value={profile.sex}
					onValueChange={(value) => update("sex", value)}
				/>
				<MeasureSlider
					label="Idade"
					icon={Cake}
					unit="anos"
					value={profile.ageYears}
					{...BODY_RANGES.ageYears}
					onValueChange={(value) => update("ageYears", value)}
				/>
			</FormSection>

			<FormSection
				title="Medidas"
				description="Arraste ou use − e + pra ajustar."
			>
				<MeasureSlider
					label="Peso"
					icon={Weight}
					unit="kg"
					value={profile.weightKg}
					{...BODY_RANGES.weightKg}
					buttonStep={0.1}
					fractionDigits={1}
					onValueChange={(value) => update("weightKg", value)}
				/>
				<MeasureSlider
					label="Altura"
					icon={Ruler}
					unit="cm"
					value={profile.heightCm}
					{...BODY_RANGES.heightCm}
					onValueChange={(value) => update("heightCm", value)}
				/>
			</FormSection>

			<FormSection
				title="Dia a dia"
				description="Como é a sua rotina SEM contar os treinos: trabalho, deslocamento, tarefas."
			>
				<OptionPicker
					label="Movimento do dia a dia"
					options={NEAT_LEVELS}
					value={profile.neatFactor}
					icons={NEAT_ICONS}
					formatHint={(option) => `Fator × ${formatFixed(option.value, 2)}`}
					onValueChange={(value) => update("neatFactor", value)}
				/>
			</FormSection>

			<FormSection
				title="Musculação"
				description="Treino com pesos ou peso do corpo. Pense na média das últimas semanas."
			>
				<TrainingFields
					question="Faz musculação?"
					icon={Dumbbell}
					routine={profile.strength}
					weightKg={profile.weightKg}
					minutesRange={TRAINING_RANGES.strengthMinutes}
					intensities={STRENGTH_INTENSITIES}
					onChange={(routine) => update("strength", routine)}
				/>
			</FormSection>

			<FormSection
				title="Cardio"
				description="Caminhada, corrida, bike, esportes e afins."
			>
				<TrainingFields
					question="Faz cardio?"
					icon={HeartPulse}
					routine={profile.cardio}
					weightKg={profile.weightKg}
					minutesRange={TRAINING_RANGES.cardioMinutes}
					intensities={CARDIO_INTENSITIES}
					onChange={(routine) => update("cardio", routine)}
				/>
			</FormSection>
		</div>
	);
}

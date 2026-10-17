"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { saveProfile } from "~/domains/profile/actions/save-profile";
import { EnergySummary } from "~/domains/profile/components/energy-summary";
import { OptionPicker } from "~/domains/profile/components/option-picker";
import { SexPicker } from "~/domains/profile/components/sex-picker";
import { TrainingFields } from "~/domains/profile/components/training-fields";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	type BmrFormula,
	CARDIO_INTENSITIES,
	calculateEnergy,
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
import { useAutosave } from "~/shared/hooks/use-autosave";
import { formatFixed } from "~/shared/lib/format";

const NEAT_ICONS = [Sofa, Laptop, PersonStanding, Footprints, HardHat];

interface TmbFormProps {
	initialProfile: BodyProfile;
	/** `true` quando o usuário ainda não tem dados salvos. */
	isExample: boolean;
	/** Fórmula da TMB escolhida em Configurações. */
	bmrFormula: BmrFormula;
}

export function TmbForm({
	initialProfile,
	isExample,
	bmrFormula,
}: TmbFormProps) {
	const [profile, setProfile] = useState(initialProfile);
	const [hasSaved, setHasSaved] = useState(!isExample);

	const { status, schedule } = useAutosave<BodyProfile>({
		save: async (value) => {
			const result = await saveProfile(value);
			if (result.ok) setHasSaved(true);
			return result.ok;
		},
	});

	useEffect(() => {
		if (status === "error") {
			toast.error("Não foi possível salvar seus dados. Tente de novo.");
		}
	}, [status]);

	function update<K extends keyof BodyProfile>(key: K, value: BodyProfile[K]) {
		const next = { ...profile, [key]: value };
		setProfile(next);
		schedule(next);
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<EnergySummary
				energy={calculateEnergy(profile, bmrFormula)}
				status={status}
				isExample={!hasSaved}
				className="sticky top-3 z-10 md:top-6 md:order-2"
			/>

			<div className="flex flex-col gap-8 md:order-1">
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
		</div>
	);
}

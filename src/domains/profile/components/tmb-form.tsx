"use client";

import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

import { saveProfile } from "~/domains/profile/actions/save-profile";
import { ActivityLevelPicker } from "~/domains/profile/components/activity-level-picker";
import { EnergySummary } from "~/domains/profile/components/energy-summary";
import { SexPicker } from "~/domains/profile/components/sex-picker";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { Cake, Ruler, Weight } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { useAutosave } from "~/shared/hooks/use-autosave";

interface TmbFormProps {
	initialProfile: BodyProfile;
	/** `true` quando o usuário ainda não tem dados salvos. */
	isExample: boolean;
}

export function TmbForm({ initialProfile, isExample }: TmbFormProps) {
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
				profile={profile}
				status={status}
				isExample={!hasSaved}
				className="sticky top-3 z-10 md:top-6 md:order-2"
			/>

			<div className="flex flex-col gap-8 md:order-1">
				<FormSection
					title="Sobre você"
					description="A fórmula muda conforme o sexo biológico e a idade."
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
					title="Rotina"
					description="Escolha a opção que mais parece com o seu dia a dia, pensando no trabalho e nos treinos."
				>
					<ActivityLevelPicker
						value={profile.activityFactor}
						onValueChange={(value) => update("activityFactor", value)}
					/>
				</FormSection>
			</div>
		</div>
	);
}

function FormSection({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3">
			<div className="flex flex-col gap-0.5">
				<h2 className="font-heading font-semibold text-lg">{title}</h2>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			{children}
		</section>
	);
}

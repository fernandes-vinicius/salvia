"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCalculatorDraftImport } from "~/domains/calculators";
import { saveProfile } from "~/domains/profile/actions/save-profile";
import { EnergySummary } from "~/domains/profile/components/energy-summary";
import { ProfileFields } from "~/domains/profile/components/profile-fields";
import { bodyProfileSchema } from "~/domains/profile/schemas/profile-schema";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	type BmrFormula,
	calculateEnergy,
} from "~/domains/profile/utils/energy";
import { useAutosave } from "~/shared/hooks/use-autosave";

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

	useCalculatorDraftImport({
		key: "profile",
		schema: bodyProfileSchema,
		enabled: isExample,
		onImport: (draft) => {
			setProfile(draft);
			schedule(draft);
			toast.success("Trouxemos os dados que você usou na calculadora.");
		},
	});

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

			<ProfileFields
				profile={profile}
				onChange={update}
				className="md:order-1"
			/>
		</div>
	);
}

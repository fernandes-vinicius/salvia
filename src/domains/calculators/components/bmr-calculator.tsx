"use client";

import { useState } from "react";

import { saveCalculatorDraft } from "~/domains/calculators/utils/calculator-draft";
import { EnergySummary } from "~/domains/profile/components/energy-summary";
import { ProfileFields } from "~/domains/profile/components/profile-fields";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	BMR_FORMULAS,
	type BmrFormula,
	calculateEnergy,
	DEFAULT_BMR_FORMULA,
	EXAMPLE_PROFILE,
} from "~/domains/profile/utils/energy";
import { Button } from "~/shared/components/ui/button";

// Calculadora pública de TMB e gasto calórico: os mesmos campos da aba TMB,
// sem conta. O resultado fica no navegador pra virar o ponto de partida no app.
export function BmrCalculator() {
	const [profile, setProfile] = useState(EXAMPLE_PROFILE);
	const [formula, setFormula] = useState<BmrFormula>(DEFAULT_BMR_FORMULA);

	function update<K extends keyof BodyProfile>(key: K, value: BodyProfile[K]) {
		const next = { ...profile, [key]: value };
		setProfile(next);
		saveCalculatorDraft({ profile: next });
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<div className="sticky top-20 z-10 flex flex-col gap-3 md:order-2">
				<EnergySummary energy={calculateEnergy(profile, formula)} />
				<fieldset className="hidden flex-col gap-2 rounded-3xl bg-card p-4 md:flex">
					<legend className="sr-only">Fórmula da TMB</legend>
					<p className="text-muted-foreground text-xs">Fórmula da TMB</p>
					<div className="grid grid-cols-2 gap-2">
						{BMR_FORMULAS.map((option) => (
							<Button
								key={option.value}
								size="sm"
								variant={formula === option.value ? "default" : "secondary"}
								aria-pressed={formula === option.value}
								onClick={() => setFormula(option.value)}
							>
								{option.label}
							</Button>
						))}
					</div>
				</fieldset>
			</div>
			<ProfileFields
				profile={profile}
				onChange={update}
				className="md:order-1"
			/>
		</div>
	);
}

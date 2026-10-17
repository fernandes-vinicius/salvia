"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	BMR_FORMULAS,
	type BmrFormula,
	calculateBmr,
} from "~/domains/profile/utils/energy";
import { saveSettings } from "~/domains/settings/actions/save-settings";
import type { UserSettings } from "~/domains/settings/types/settings-types";
import { ChoiceCard } from "~/shared/components/choice-card";
import { FormSection } from "~/shared/components/form-section";
import {
	BookOpen,
	CircleAlert,
	CloudCheck,
	FlaskConical,
	Loader2Icon,
	type LucideIcon,
} from "~/shared/components/icons";
import { RadioGroup } from "~/shared/components/ui/radio-group";
import { type AutosaveStatus, useAutosave } from "~/shared/hooks/use-autosave";
import { formatNumber } from "~/shared/lib/format";

const FORMULA_ICONS: Record<BmrFormula, LucideIcon> = {
	mifflin: FlaskConical,
	harris: BookOpen,
};

interface SettingsFormProps {
	initialSettings: UserSettings;
	/** Usado pra mostrar a TMB de cada fórmula com os dados do usuário. */
	profile: BodyProfile | null;
}

export function SettingsForm({ initialSettings, profile }: SettingsFormProps) {
	const [settings, setSettings] = useState(initialSettings);

	const { status, schedule } = useAutosave<UserSettings>({
		save: async (value) => (await saveSettings(value)).ok,
		delay: 300,
	});

	useEffect(() => {
		if (status === "error") {
			toast.error("Não foi possível salvar a configuração. Tente de novo.");
		}
	}, [status]);

	function update(next: UserSettings) {
		setSettings(next);
		schedule(next);
	}

	return (
		<FormSection
			title="Fórmula da taxa metabólica (TMB)"
			description="Muda o cálculo de quanto você gasta em repouso e, com isso, o gasto diário e a meta nas abas TMB e Meta."
		>
			<RadioGroup
				aria-label="Fórmula da TMB"
				value={settings.bmrFormula}
				onValueChange={(value) =>
					update({ ...settings, bmrFormula: value as BmrFormula })
				}
				className="gap-2"
			>
				{BMR_FORMULAS.map((formula) => (
					<ChoiceCard
						key={formula.value}
						value={formula.value}
						icon={FORMULA_ICONS[formula.value]}
						title={formula.label}
						description={formula.description}
						tags={formula.value === "mifflin" ? ["Recomendada"] : undefined}
						hint={
							profile
								? `Com seus dados: ${formatNumber(calculateBmr(profile, formula.value))} kcal em repouso`
								: undefined
						}
					/>
				))}
			</RadioGroup>
			<InlineSaveStatus status={status} />
		</FormSection>
	);
}

function InlineSaveStatus({ status }: { status: AutosaveStatus }) {
	if (status === "idle") return null;

	return (
		<output className="flex items-center gap-1.5 px-1 text-muted-foreground text-xs">
			{status === "error" ? (
				<>
					<CircleAlert className="size-3.5" /> Não salvou
				</>
			) : status === "saved" ? (
				<>
					<CloudCheck className="size-3.5" /> Salvo
				</>
			) : (
				<>
					<Loader2Icon className="size-3.5 animate-spin" /> Salvando…
				</>
			)}
		</output>
	);
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCalculatorDraftImport } from "~/domains/calculators";
import { saveGoal } from "~/domains/goal/actions/save-goal";
import { GoalFields } from "~/domains/goal/components/goal-fields";
import { TargetSummary } from "~/domains/goal/components/target-summary";
import { goalSchema } from "~/domains/goal/schemas/goal-schema";
import type { Goal } from "~/domains/goal/types/goal-types";
import { calculateTargets } from "~/domains/goal/utils/goal";
import type { ProteinCounting } from "~/domains/goal/utils/protein-counting";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	type BmrFormula,
	calculateBmr,
	calculateTdee,
} from "~/domains/profile/utils/energy";
import { useAutosave } from "~/shared/hooks/use-autosave";
import { analytics } from "~/shared/lib/analytics/analytics";

interface GoalFormProps {
	profile: BodyProfile;
	initialGoal: Goal;
	/** `true` quando o usuário ainda não salvou uma meta. */
	isExample: boolean;
	/** Fórmula da TMB escolhida em Configurações. */
	bmrFormula: BmrFormula;
	/** Ajuste do gasto pelo peso real (kcal/dia). */
	calibrationKcal: number;
	proteinCounting: ProteinCounting;
}

export function GoalForm({
	profile,
	initialGoal,
	isExample,
	bmrFormula,
	calibrationKcal,
	proteinCounting,
}: GoalFormProps) {
	const [goal, setGoal] = useState(initialGoal);
	const [hasSaved, setHasSaved] = useState(!isExample);
	// Muda quando a meta é trocada de fora (rascunho da calculadora), pra os
	// campos recalcularem o estado interno (ritmo personalizado).
	const [fieldsKey, setFieldsKey] = useState(0);

	const { status, schedule } = useAutosave<Goal>({
		save: async (value) => {
			const result = await saveGoal(value);
			if (result.ok) {
				// Funil: só a primeira vez que a pessoa salva a Meta.
				if (!hasSaved)
					analytics.track("meta_salva", { objetivo: value.objective });
				setHasSaved(true);
			}
			return result.ok;
		},
	});

	useEffect(() => {
		if (status === "error") {
			toast.error("Não foi possível salvar sua meta. Tente de novo.");
		}
	}, [status]);

	const tdee = calculateTdee(profile, bmrFormula);
	const targets = calculateTargets(goal, {
		tdee: tdee + calibrationKcal,
		bmr: calculateBmr(profile, bmrFormula),
		weightKg: profile.weightKg,
	});

	useCalculatorDraftImport({
		key: "goal",
		schema: goalSchema,
		enabled: isExample,
		onImport: (draft) => {
			setGoal(draft);
			setFieldsKey((key) => key + 1);
			schedule(draft);
			toast.success("Trouxemos a meta que você montou na calculadora.");
		},
	});

	function update(next: Goal) {
		setGoal(next);
		schedule(next);
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<TargetSummary
				proteinCounting={proteinCounting}
				targets={targets}
				tdee={tdee}
				calorieAdjustment={goal.calorieAdjustment}
				calibrationKcal={calibrationKcal}
				status={status}
				isExample={!hasSaved}
				className="sticky top-3 z-10 md:top-6 md:order-2"
			/>

			<GoalFields
				proteinCounting={proteinCounting}
				key={fieldsKey}
				goal={goal}
				targets={targets}
				onChange={update}
				className="md:order-1"
			/>
		</div>
	);
}

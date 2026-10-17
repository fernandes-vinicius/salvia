"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { saveGoal } from "~/domains/goal/actions/save-goal";
import { GoalWarnings } from "~/domains/goal/components/goal-warnings";
import { MacroTargets } from "~/domains/goal/components/macro-targets";
import { ObjectivePicker } from "~/domains/goal/components/objective-picker";
import { PacePicker } from "~/domains/goal/components/pace-picker";
import { TargetSummary } from "~/domains/goal/components/target-summary";
import type { Goal, Objective } from "~/domains/goal/types/goal-types";
import {
	calculateTargets,
	defaultGoalFor,
	findPace,
} from "~/domains/goal/utils/goal";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	type BmrFormula,
	calculateBmr,
	calculateTdee,
} from "~/domains/profile/utils/energy";
import { FormSection } from "~/shared/components/form-section";
import { useAutosave } from "~/shared/hooks/use-autosave";

interface GoalFormProps {
	profile: BodyProfile;
	initialGoal: Goal;
	/** `true` quando o usuário ainda não salvou uma meta. */
	isExample: boolean;
	/** Fórmula da TMB escolhida em Configurações. */
	bmrFormula: BmrFormula;
}

export function GoalForm({
	profile,
	initialGoal,
	isExample,
	bmrFormula,
}: GoalFormProps) {
	const [goal, setGoal] = useState(initialGoal);
	const [isCustomPace, setIsCustomPace] = useState(
		initialGoal.objective !== "maintain" &&
			!findPace(initialGoal.objective, initialGoal.calorieAdjustment),
	);
	const [hasSaved, setHasSaved] = useState(!isExample);

	const { status, schedule } = useAutosave<Goal>({
		save: async (value) => {
			const result = await saveGoal(value);
			if (result.ok) setHasSaved(true);
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
		tdee,
		bmr: calculateBmr(profile, bmrFormula),
		weightKg: profile.weightKg,
	});

	function update(next: Goal) {
		setGoal(next);
		schedule(next);
	}

	// Trocar de objetivo volta pro ritmo recomendado e macros sugeridos dele.
	function handleObjectiveChange(objective: Objective) {
		setIsCustomPace(false);
		update(defaultGoalFor(objective));
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<TargetSummary
				targets={targets}
				tdee={tdee}
				calorieAdjustment={goal.calorieAdjustment}
				status={status}
				isExample={!hasSaved}
				className="sticky top-3 z-10 md:top-6 md:order-2"
			/>

			<div className="flex flex-col gap-8 md:order-1">
				<FormSection title="Objetivo" description="O que você quer agora?">
					<ObjectivePicker
						value={goal.objective}
						onValueChange={handleObjectiveChange}
					/>
				</FormSection>

				{goal.objective !== "maintain" && (
					<FormSection
						title="Ritmo"
						description={
							goal.objective === "lose"
								? "Quanto mais rápido, mais difícil de manter. O recomendado é seguro para a maioria."
								: "Ganhar devagar ajuda a ganhar mais músculo e menos gordura."
						}
					>
						<PacePicker
							objective={goal.objective}
							adjustment={goal.calorieAdjustment}
							isCustom={isCustomPace}
							onPresetChange={(calorieAdjustment) => {
								setIsCustomPace(false);
								update({ ...goal, calorieAdjustment });
							}}
							onCustomToggle={() => setIsCustomPace(true)}
							onCustomChange={(calorieAdjustment) =>
								update({ ...goal, calorieAdjustment })
							}
						/>
					</FormSection>
				)}

				<FormSection
					title="Macros"
					description="Sugeridos para o seu objetivo. Ajuste só se quiser."
				>
					<GoalWarnings warnings={targets.warnings} />
					<MacroTargets
						goal={goal}
						targets={targets}
						onChange={(macros) => update({ ...goal, ...macros })}
					/>
				</FormSection>
			</div>
		</div>
	);
}

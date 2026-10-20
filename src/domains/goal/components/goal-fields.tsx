"use client";

import { useState } from "react";
import { GoalWarnings } from "~/domains/goal/components/goal-warnings";
import { MacroTargets } from "~/domains/goal/components/macro-targets";
import { ObjectivePicker } from "~/domains/goal/components/objective-picker";
import { PacePicker } from "~/domains/goal/components/pace-picker";
import type {
	Goal,
	GoalTargets,
	Objective,
} from "~/domains/goal/types/goal-types";
import { defaultGoalFor, findPace } from "~/domains/goal/utils/goal";
import {
	carbsInsight,
	fatInsight,
	paceInsight,
	proteinInsight,
	weeklyTrainingHours,
} from "~/domains/goal/utils/insights";
import {
	DEFAULT_PROTEIN_COUNTING,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { FormSection } from "~/shared/components/form-section";
import { WhyItMatters } from "~/shared/components/why-it-matters";
import { cn } from "~/shared/lib/utils";

interface GoalFieldsProps {
	goal: Goal;
	targets: GoalTargets;
	onChange: (goal: Goal) => void;
	className?: string;
	/** Proteína total (padrão, também sem sessão) ou só animal. */
	proteinCounting?: ProteinCounting;
	/** Peso e treinos, pras dicas "Por que isso importa?". */
	profile: Pick<BodyProfile, "weightKg" | "strength" | "cardio">;
}

// Campos da Meta (objetivo, ritmo e macros). Usados na aba Meta (com
// autosave) e na calculadora pública de macros (só estado local).
export function GoalFields({
	goal,
	targets,
	onChange,
	className,
	proteinCounting = DEFAULT_PROTEIN_COUNTING,
	profile,
}: GoalFieldsProps) {
	const { weightKg } = profile;
	const pace = paceInsight({
		objective: goal.objective,
		calorieAdjustment: goal.calorieAdjustment,
		weightKg,
	});
	const macroInsights = [
		{
			label: "Proteína",
			...proteinInsight({
				objective: goal.objective,
				proteinPerKg: goal.proteinPerKg,
				weightKg,
				counting: proteinCounting,
			}),
		},
		{
			label: "Gordura",
			...fatInsight({
				fatPerKg: goal.fatPerKg,
				weightKg,
				calories: targets.calories,
			}),
		},
		{
			label: "Carboidrato",
			...carbsInsight({
				objective: goal.objective,
				carbsPerKg: targets.carbs.perKg,
				weightKg,
				trainingHours: weeklyTrainingHours(profile),
			}),
		},
	];
	const [isCustomPace, setIsCustomPace] = useState(
		goal.objective !== "maintain" &&
			!findPace(goal.objective, goal.calorieAdjustment),
	);

	// Trocar de objetivo volta pro ritmo recomendado e macros sugeridos dele.
	function handleObjectiveChange(objective: Objective) {
		setIsCustomPace(false);
		onChange(defaultGoalFor(objective));
	}

	return (
		<div className={cn("flex flex-col gap-8", className)}>
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
							onChange({ ...goal, calorieAdjustment });
						}}
						onCustomToggle={() => setIsCustomPace(true)}
						onCustomChange={(calorieAdjustment) =>
							onChange({ ...goal, calorieAdjustment })
						}
					/>
					{pace && (
						<WhyItMatters attention={pace.attention}>
							<p>{pace.text}</p>
						</WhyItMatters>
					)}
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
					onChange={(macros) => onChange({ ...goal, ...macros })}
					proteinCounting={proteinCounting}
				/>
				<WhyItMatters
					attention={macroInsights.some((insight) => insight.attention)}
				>
					{macroInsights.map((insight) => (
						<p key={insight.label}>
							<strong className="font-semibold">{insight.label}.</strong>{" "}
							{insight.text}
						</p>
					))}
				</WhyItMatters>
			</FormSection>
		</div>
	);
}

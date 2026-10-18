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
import { FormSection } from "~/shared/components/form-section";
import { cn } from "~/shared/lib/utils";

interface GoalFieldsProps {
	goal: Goal;
	targets: GoalTargets;
	onChange: (goal: Goal) => void;
	className?: string;
}

// Campos da Meta (objetivo, ritmo e macros). Usados na aba Meta (com
// autosave) e na calculadora pública de macros (só estado local).
export function GoalFields({
	goal,
	targets,
	onChange,
	className,
}: GoalFieldsProps) {
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
				/>
			</FormSection>
		</div>
	);
}

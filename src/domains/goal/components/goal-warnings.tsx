import type { GoalWarning } from "~/domains/goal/types/goal-types";
import { TriangleAlertIcon } from "~/shared/components/icons";
import { Alert, AlertDescription } from "~/shared/components/ui/alert";

export const GOAL_WARNING_MESSAGES: Record<GoalWarning, string> = {
	"below-bmr":
		"Sua meta ficou abaixo do que o corpo gasta em repouso (TMB). Prefira um ritmo mais leve ou procure um nutricionista.",
	"carbs-negative":
		"Proteína e gordura já passam da meta de calorias, então não sobra carboidrato. Diminua a gordura, a proteína ou o quanto você corta de calorias.",
	"carbs-low":
		"Sobrou pouco carboidrato (menos de 1 g por kg). Considere diminuir a gordura ou usar um ritmo mais leve.",
};

export function GoalWarnings({ warnings }: { warnings: GoalWarning[] }) {
	if (warnings.length === 0) return null;

	return (
		<div className="flex flex-col gap-2">
			{warnings.map((warning) => (
				<Alert key={warning} variant="destructive">
					<TriangleAlertIcon />
					<AlertDescription>{GOAL_WARNING_MESSAGES[warning]}</AlertDescription>
				</Alert>
			))}
		</div>
	);
}

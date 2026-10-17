// Só exports seguros pro client. Server-only (goal-service) é importado pelo
// caminho direto.
export { GoalForm } from "~/domains/goal/components/goal-form";
export type {
	Goal,
	GoalTargets,
	Objective,
} from "~/domains/goal/types/goal-types";
export { calculateTargets, EXAMPLE_GOAL } from "~/domains/goal/utils/goal";

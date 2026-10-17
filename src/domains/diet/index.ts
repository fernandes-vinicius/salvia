// Só exports seguros pro client. Server-only (diet-service) é importado pelo
// caminho direto.
export { DietView } from "~/domains/diet/components/diet-view";
export type {
	DietItem,
	DietMeal,
	DietSummary,
} from "~/domains/diet/types/diet-types";
export { summarizeDiet } from "~/domains/diet/utils/diet";

// Só exports seguros pro client. Server-only (checkin-service) é importado
// pelo caminho direto.
export { CheckinCard } from "~/domains/checkin/components/checkin-card";
export type {
	Checkin,
	CheckinMeal,
} from "~/domains/checkin/types/checkin-types";
export { addDays } from "~/domains/checkin/utils/checkin";

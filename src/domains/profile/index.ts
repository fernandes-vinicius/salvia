// Só exports seguros pro client. Server-only (profile-service) é importado
// pelo caminho direto.
export { TmbForm } from "~/domains/profile/components/tmb-form";
export type {
	BodyProfile,
	EnergyBreakdown,
	Sex,
	TrainingRoutine,
} from "~/domains/profile/types/profile-types";
export {
	calculateBmr,
	calculateEnergy,
	calculateTdee,
	EXAMPLE_PROFILE,
} from "~/domains/profile/utils/energy";

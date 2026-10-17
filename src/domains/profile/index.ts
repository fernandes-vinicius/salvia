// Só exports seguros pro client. Server-only (profile-service) é importado
// pelo caminho direto.
export { TmbForm } from "~/domains/profile/components/tmb-form";
export type { BodyProfile, Sex } from "~/domains/profile/types/profile-types";
export {
	ACTIVITY_LEVELS,
	calculateBmr,
	calculateTdee,
	EXAMPLE_PROFILE,
} from "~/domains/profile/utils/energy";

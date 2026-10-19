import type { BmrFormula } from "~/domains/profile/utils/energy";

export interface UserSettings {
	bmrFormula: BmrFormula;
	/** Comemorações animadas ao cumprir metas. */
	celebrations: boolean;
}

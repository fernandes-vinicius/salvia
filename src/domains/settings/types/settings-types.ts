import type { ProteinCounting } from "~/domains/goal/utils/protein-counting";
import type { BmrFormula } from "~/domains/profile/utils/energy";

export interface UserSettings {
	bmrFormula: BmrFormula;
	/** Comemorações animadas ao cumprir metas. */
	celebrations: boolean;
	/** Proteína que conta pra meta (coluna P ou P(A)). */
	proteinCounting: ProteinCounting;
}

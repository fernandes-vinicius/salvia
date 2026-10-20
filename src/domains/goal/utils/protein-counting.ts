import type { Macros } from "~/domains/food/types/food-types";

// Como a proteína conta pra meta (Configurações). Padrão: total (animal +
// vegetal), o jeito da maioria dos nutricionistas. "Só animal" é o método da
// planilha original: a vegetal aparece no Resumo do dia mas não conta.

export type ProteinCounting = "total" | "animal";

export const DEFAULT_PROTEIN_COUNTING: ProteinCounting = "total";

export const PROTEIN_LABELS: Record<
	ProteinCounting,
	{ column: string; title: string; lower: string; hint: string }
> = {
	total: {
		column: "P",
		title: "Proteína",
		lower: "proteína",
		hint: "Proteína total: carnes, ovos, laticínios e whey, mais a vegetal (feijão, arroz, pão).",
	},
	animal: {
		column: "P(A)",
		title: "Proteína animal",
		lower: "proteína animal",
		hint: "Proteína animal: carnes, ovos, laticínios e whey. A vegetal (feijão, arroz, pão) aparece no resumo, mas não conta pra meta.",
	},
};

/** A proteína que conta pra meta, conforme a preferência. */
export function countedProtein(
	macros: Pick<Macros, "proteinAnimal" | "proteinVegetal">,
	counting: ProteinCounting,
) {
	return counting === "total"
		? macros.proteinAnimal + macros.proteinVegetal
		: macros.proteinAnimal;
}

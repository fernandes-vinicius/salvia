import type { Macros } from "~/domains/food/types/food-types";
import { kcalFor } from "~/domains/food/utils/food";
import { formatNumber } from "~/shared/lib/format";

// Resumo compacto de uma porção: "P 26 A · C 3 · G 18 · 374 kcal".
export function MacroLine({ macros }: { macros: Macros }) {
	const isAnimal = macros.proteinAnimal >= macros.proteinVegetal;
	const protein = macros.proteinAnimal + macros.proteinVegetal;

	return (
		<p className="text-muted-foreground text-xs tabular-nums">
			P {formatNumber(protein)} {protein > 0 ? (isAnimal ? "A" : "V") : ""} · C{" "}
			{formatNumber(macros.carbs)} · G {formatNumber(macros.fat)} ·{" "}
			<span className="font-medium text-foreground">
				{formatNumber(kcalFor(macros))} kcal
			</span>
		</p>
	);
}

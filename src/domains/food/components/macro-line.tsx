import type { Macros } from "~/domains/food/types/food-types";
import { kcalFor } from "~/domains/food/utils/food";
import { formatNumber } from "~/shared/lib/format";

// Resumo compacto de uma porção: "P 26 · C 3 · G 18 · 374 kcal", com letra e
// valor na cor de cada macro (proteína: verde-escuro animal, sálvia vegetal).
export function MacroLine({ macros }: { macros: Macros }) {
	const isAnimal = macros.proteinAnimal >= macros.proteinVegetal;
	const protein = macros.proteinAnimal + macros.proteinVegetal;

	const parts = [
		{
			label: "P",
			value: protein,
			color: isAnimal
				? "text-macro-protein-ink"
				: "text-macro-protein-vegetal-ink",
			title: isAnimal ? "Proteína animal" : "Proteína vegetal",
		},
		{
			label: "C",
			value: macros.carbs,
			color: "text-macro-carb-ink",
			title: "Carboidrato",
		},
		{
			label: "G",
			value: macros.fat,
			color: "text-macro-fat-ink",
			title: "Gordura",
		},
	];

	return (
		<p className="flex flex-wrap items-center gap-x-2 text-xs tabular-nums">
			{parts.map((part) => (
				<span key={part.label} className={part.color} title={part.title}>
					{part.label} {formatNumber(part.value)}
				</span>
			))}
			<span className="font-medium text-foreground">
				{formatNumber(kcalFor(macros))} kcal
			</span>
		</p>
	);
}

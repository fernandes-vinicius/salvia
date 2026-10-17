import type { Macros } from "~/domains/food/types/food-types";
import { kcalFor } from "~/domains/food/utils/food";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

// Resumo compacto de uma porção: "●P 26 · ●C 3 · ●G 18 · 374 kcal", com as
// cores dos macros (proteína: verde-escuro animal, sálvia claro vegetal).
export function MacroLine({ macros }: { macros: Macros }) {
	const isAnimal = macros.proteinAnimal >= macros.proteinVegetal;
	const protein = macros.proteinAnimal + macros.proteinVegetal;

	const parts = [
		{
			label: "P",
			value: protein,
			dot: isAnimal ? "bg-macro-protein" : "bg-macro-protein-vegetal",
			title: isAnimal ? "Proteína animal" : "Proteína vegetal",
		},
		{
			label: "C",
			value: macros.carbs,
			dot: "bg-macro-carb",
			title: "Carboidrato",
		},
		{ label: "G", value: macros.fat, dot: "bg-macro-fat", title: "Gordura" },
	];

	return (
		<p className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs tabular-nums">
			{parts.map((part) => (
				<span
					key={part.label}
					className="inline-flex items-center gap-1"
					title={part.title}
				>
					<span className={cn("size-1.5 rounded-full", part.dot)} />
					{part.label} {formatNumber(part.value)}
				</span>
			))}
			<span className="font-medium text-foreground">
				{formatNumber(kcalFor(macros))} kcal
			</span>
		</p>
	);
}

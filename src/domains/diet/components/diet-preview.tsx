import { PrintHeader } from "~/domains/diet/components/print-header";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { itemMacros, mealMacros } from "~/domains/diet/utils/diet";
import { kcalFor, UNIT_LABELS } from "~/domains/food/utils/food";
import { Clock } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

// Modo "Visualizar": a dieta só pra leitura, uma refeição abaixo da outra,
// com o nome completo de cada alimento e a quantidade. É também o que vai
// pro PDF (impressão do navegador). Sem estado: renderiza no servidor (a
// landing usa sem JS); o cabeçalho/ajuste do PDF só entra com `printable`.
export function DietPreview({
	meals,
	printable = false,
}: {
	meals: DietMeal[];
	printable?: boolean;
}) {
	return (
		<div className="flex flex-col gap-4">
			{printable && <PrintHeader />}
			{meals.map((meal) => (
				<PreviewMeal key={meal.id} meal={meal} />
			))}
		</div>
	);
}

function PreviewMeal({ meal }: { meal: DietMeal }) {
	const total = mealMacros(meal);

	return (
		<section
			aria-label={meal.name}
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5 print:break-inside-avoid print:border print:border-border"
		>
			<header className="flex items-baseline justify-between gap-3">
				<h3 className="font-heading font-semibold text-lg">{meal.name}</h3>
				<p className="flex shrink-0 items-center gap-1.5 text-muted-foreground text-sm tabular-nums">
					{meal.time && (
						<>
							<Clock className="size-3.5" />
							<span>{meal.time}</span>
							<span aria-hidden>·</span>
						</>
					)}
					<span>{formatNumber(kcalFor(total))} kcal</span>
				</p>
			</header>

			{meal.items.length > 0 ? (
				<table className="w-full text-sm tabular-nums">
					<thead>
						<tr className="text-xs">
							<th className="pb-1.5 text-left font-normal text-muted-foreground">
								Alimento
							</th>
							<th className="hidden w-20 pb-1.5 text-right font-normal text-muted-foreground sm:table-cell print:table-cell">
								Qtd.
							</th>
							<th className="w-12 pb-1.5 text-right font-medium text-macro-protein-ink">
								<abbr title="Proteína animal" className="no-underline">
									P(A)
								</abbr>
							</th>
							<th className="w-11 pb-1.5 text-right font-medium text-macro-carb-ink">
								<abbr title="Carboidrato" className="no-underline">
									C
								</abbr>
							</th>
							<th className="w-11 pb-1.5 text-right font-medium text-macro-fat-ink">
								<abbr title="Gordura" className="no-underline">
									G
								</abbr>
							</th>
							<th className="w-14 pb-1.5 text-right font-normal text-muted-foreground">
								kcal
							</th>
						</tr>
					</thead>
					<tbody>
						{meal.items.map((item) => {
							const macros = itemMacros(item);
							const isAnimal = item.food.proteinSource === "animal";
							const quantity = `${formatNumber(item.quantity, 1)} ${UNIT_LABELS[item.food.unit].short}`;
							return (
								<tr key={item.id} className="border-border border-t">
									<td className="py-2 pr-2 leading-snug">
										{item.food.name}
										{/* No celular a quantidade fica embaixo do nome. */}
										<span className="block text-muted-foreground text-xs sm:hidden print:hidden">
											{quantity}
										</span>
									</td>
									<td className="hidden py-2 text-right text-muted-foreground sm:table-cell print:table-cell">
										{quantity}
									</td>
									<td
										className={cn(
											"py-2 text-right",
											isAnimal
												? "text-macro-protein-ink"
												: "text-macro-protein-vegetal-ink",
										)}
										title={isAnimal ? "Proteína animal" : "Proteína vegetal"}
									>
										{formatNumber(macros.proteinAnimal + macros.proteinVegetal)}
									</td>
									<td className="py-2 text-right text-macro-carb-ink">
										{formatNumber(macros.carbs)}
									</td>
									<td className="py-2 text-right text-macro-fat-ink">
										{formatNumber(macros.fat)}
									</td>
									<td className="py-2 text-right text-muted-foreground">
										{formatNumber(kcalFor(macros))}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr className="border-border border-t font-semibold">
							<td className="py-2">Total</td>
							<td className="hidden sm:table-cell print:table-cell" />
							<td className="py-2 text-right text-macro-protein-ink">
								{formatNumber(total.proteinAnimal + total.proteinVegetal)}
							</td>
							<td className="py-2 text-right text-macro-carb-ink">
								{formatNumber(total.carbs)}
							</td>
							<td className="py-2 text-right text-macro-fat-ink">
								{formatNumber(total.fat)}
							</td>
							<td className="py-2 text-right">
								{formatNumber(kcalFor(total))}
							</td>
						</tr>
					</tfoot>
				</table>
			) : (
				<p className="text-muted-foreground text-sm">Sem alimentos.</p>
			)}
		</section>
	);
}

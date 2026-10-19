"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
	MealMenu,
	type MealMenuActions,
} from "~/domains/diet/components/meal-menu";
import { SortableItemRow } from "~/domains/diet/components/sortable-item-row";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { mealMacros } from "~/domains/diet/utils/diet";
import { kcalFor } from "~/domains/food/utils/food";
import { Clock, Plus } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { formatNonZero, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface MealCardProps extends MealMenuActions {
	meal: DietMeal;
	onAddFood: () => void;
	onEditItem: (itemId: string) => void;
}

// Um bloco da grade (como "Refeição 1 - 9h" na planilha): alimentos em linhas
// com P(A) · C · G · kcal e o total. O card inteiro é área de soltar (pra
// receber alimentos arrastados, inclusive quando está vazio).
export function MealCard({
	meal,
	onAddFood,
	onEditItem,
	...menu
}: MealCardProps) {
	const { setNodeRef, isOver } = useDroppable({ id: meal.id });
	const total = mealMacros(meal);
	const totalKcal = kcalFor(total);

	return (
		<section
			ref={setNodeRef}
			aria-label={meal.name}
			className={cn(
				"flex flex-col gap-2 rounded-3xl bg-card p-4 ring-2 ring-transparent transition-shadow",
				isOver && "ring-primary/30",
			)}
		>
			<header className="flex items-center gap-2">
				<div className="flex min-w-0 flex-1 flex-col">
					<h3 className="truncate font-heading font-semibold">{meal.name}</h3>
					<p className="flex items-center gap-1.5 text-muted-foreground text-xs tabular-nums">
						{meal.time && (
							<>
								<Clock className="size-3" />
								<span>{meal.time}</span>
								<span aria-hidden>·</span>
							</>
						)}
						<span>{formatNumber(totalKcal)} kcal</span>
					</p>
				</div>
				<MealMenu meal={meal} {...menu} />
			</header>

			<SortableContext
				items={meal.items.map((item) => item.id)}
				strategy={verticalListSortingStrategy}
			>
				{meal.items.length > 0 ? (
					// Cada macro na sua cor (letra e valor), como no resumo. A coluna
					// de proteína é só a animal (a da meta, pra distribuir entre as
					// refeições); a vegetal aparece no resumo do dia.
					<table className="w-full text-sm tabular-nums">
						<thead>
							<tr className="text-xs">
								<th className="w-5 pb-1">
									<span className="sr-only">Arrastar</span>
								</th>
								<th className="pb-1 text-left font-normal text-muted-foreground">
									Alimento
								</th>
								<th className="w-11 pb-1 text-right font-medium text-macro-protein-ink">
									<abbr title="Proteína animal" className="no-underline">
										P(A)
									</abbr>
								</th>
								<th className="w-10 pb-1 text-right font-medium text-macro-carb-ink">
									<abbr title="Carboidrato" className="no-underline">
										C
									</abbr>
								</th>
								<th className="w-10 pb-1 text-right font-medium text-macro-fat-ink">
									<abbr title="Gordura" className="no-underline">
										G
									</abbr>
								</th>
								<th className="w-12 pb-1 text-right font-normal text-muted-foreground">
									kcal
								</th>
							</tr>
						</thead>
						<tbody>
							{meal.items.map((item) => (
								<SortableItemRow
									key={item.id}
									item={item}
									onEdit={() => onEditItem(item.id)}
								/>
							))}
						</tbody>
						<tfoot>
							<tr className="border-border border-t font-semibold">
								<td />
								<td className="py-2">Total</td>
								<td className="py-2 text-right text-macro-protein-ink">
									{formatNonZero(total.proteinAnimal)}
								</td>
								<td className="py-2 text-right text-macro-carb-ink">
									{formatNonZero(total.carbs)}
								</td>
								<td className="py-2 text-right text-macro-fat-ink">
									{formatNonZero(total.fat)}
								</td>
								<td className="py-2 text-right">{formatNonZero(totalKcal)}</td>
							</tr>
						</tfoot>
					</table>
				) : (
					<p className="rounded-2xl border-2 border-border border-dashed py-4 text-center text-muted-foreground text-sm">
						Nenhum alimento ainda. Adicione ou arraste um pra cá.
					</p>
				)}
			</SortableContext>

			<Button
				variant="ghost"
				className="self-start text-primary"
				onClick={onAddFood}
			>
				<Plus data-icon="inline-start" />
				Adicionar alimento
			</Button>
		</section>
	);
}

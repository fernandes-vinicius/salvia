"use client";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { itemMacros, mealMacros } from "~/domains/diet/utils/diet";
import { kcalFor, UNIT_LABELS } from "~/domains/food/utils/food";
import {
	ArrowDown,
	ArrowUp,
	Clock,
	EllipsisVertical,
	Pencil,
	Plus,
	Trash2,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { formatNumber } from "~/shared/lib/format";

interface MealCardProps {
	meal: DietMeal;
	isFirst: boolean;
	isLast: boolean;
	canDelete: boolean;
	onAddFood: () => void;
	onEditItem: (itemId: string) => void;
	onEdit: () => void;
	onMove: (direction: -1 | 1) => void;
	onDelete: () => void;
}

// Um bloco da grade (como "Refeição 1 - 9h" na planilha): alimentos em linhas
// com P · C · G · kcal e o total da refeição.
export function MealCard({
	meal,
	isFirst,
	isLast,
	canDelete,
	onAddFood,
	onEditItem,
	onEdit,
	onMove,
	onDelete,
}: MealCardProps) {
	const total = mealMacros(meal);
	const totalKcal = kcalFor(total);

	return (
		<section
			aria-label={meal.name}
			className="flex flex-col gap-2 rounded-3xl bg-card p-4"
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
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Opções de ${meal.name}`}
							/>
						}
					>
						<EllipsisVertical />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onEdit}>
							<Pencil />
							Renomear e horário
						</DropdownMenuItem>
						<DropdownMenuItem disabled={isFirst} onClick={() => onMove(-1)}>
							<ArrowUp />
							Mover para cima
						</DropdownMenuItem>
						<DropdownMenuItem disabled={isLast} onClick={() => onMove(1)}>
							<ArrowDown />
							Mover para baixo
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							disabled={!canDelete}
							onClick={onDelete}
						>
							<Trash2 />
							Remover refeição
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>

			{meal.items.length > 0 ? (
				<table className="w-full text-sm tabular-nums">
					<thead>
						<tr className="text-muted-foreground text-xs">
							<th className="pb-1 text-left font-normal">Alimento</th>
							<th className="w-10 pb-1 text-right font-normal">P</th>
							<th className="w-10 pb-1 text-right font-normal">C</th>
							<th className="w-10 pb-1 text-right font-normal">G</th>
							<th className="w-12 pb-1 text-right font-normal">kcal</th>
						</tr>
					</thead>
					<tbody>
						{meal.items.map((item) => {
							const macros = itemMacros(item);
							const protein = macros.proteinAnimal + macros.proteinVegetal;
							return (
								<tr
									key={item.id}
									className="cursor-pointer border-border border-t transition-colors hover:bg-accent"
									onClick={() => onEditItem(item.id)}
								>
									<td className="max-w-0 py-2 pr-2">
										<button
											type="button"
											className="block w-full truncate text-left outline-none focus-visible:underline"
											onClick={(event) => {
												event.stopPropagation();
												onEditItem(item.id);
											}}
										>
											{item.food.name}
										</button>
										<span className="text-muted-foreground text-xs">
											{formatNumber(item.quantity, 1)}{" "}
											{UNIT_LABELS[item.food.unit].short}
										</span>
									</td>
									<td className="py-2 text-right">
										{formatNumber(protein)}
										{protein > 0 && (
											<span className="ml-0.5 text-[0.625rem] text-muted-foreground">
												{item.food.proteinSource === "animal" ? "A" : "V"}
											</span>
										)}
									</td>
									<td className="py-2 text-right">
										{formatNumber(macros.carbs)}
									</td>
									<td className="py-2 text-right">
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
						<tr className="border-border border-t font-medium">
							<td className="py-2">Total</td>
							<td className="py-2 text-right">
								{formatNumber(total.proteinAnimal + total.proteinVegetal)}
							</td>
							<td className="py-2 text-right">{formatNumber(total.carbs)}</td>
							<td className="py-2 text-right">{formatNumber(total.fat)}</td>
							<td className="py-2 text-right">{formatNumber(totalKcal)}</td>
						</tr>
					</tfoot>
				</table>
			) : (
				<p className="py-2 text-muted-foreground text-sm">
					Nenhum alimento ainda.
				</p>
			)}

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

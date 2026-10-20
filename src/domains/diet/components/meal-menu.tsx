"use client";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	ChefHat,
	Clock,
	EllipsisVertical,
	Pencil,
	Shuffle,
	Sparkles,
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

export interface MealMenuActions {
	canDelete: boolean;
	onRename: () => void;
	onEditTime: () => void;
	onDelete: () => void;
	/** Recursos em beta: só vêm quando liberados (`BETA_EMAILS`). */
	onSuggestRecipe?: () => void;
	onVaryMeal?: () => void;
	onOpenSavedRecipes?: () => void;
	/** Receitas salvas desta refeição. */
	savedRecipes?: number;
}

// Menu ⋮ da refeição, igual nos modos Editar (card da grade) e Visualizar.
export function MealMenu({
	meal,
	canDelete,
	onRename,
	onEditTime,
	onDelete,
	onSuggestRecipe,
	onVaryMeal,
	onOpenSavedRecipes,
	savedRecipes = 0,
}: MealMenuActions & { meal: DietMeal }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Opções de ${meal.name}`}
						className="shrink-0 print:hidden"
					/>
				}
			>
				<EllipsisVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-auto">
				<DropdownMenuItem onClick={onRename}>
					<Pencil />
					Renomear
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onEditTime}>
					<Clock />
					{meal.time ? "Alterar horário" : "Definir horário"}
				</DropdownMenuItem>
				{onSuggestRecipe && meal.items.length > 0 && (
					<DropdownMenuItem onClick={onSuggestRecipe}>
						<Sparkles />
						Sugerir receita (beta)
					</DropdownMenuItem>
				)}
				{onVaryMeal && meal.items.length > 0 && (
					<DropdownMenuItem onClick={onVaryMeal}>
						<Shuffle />
						Variar refeição (beta)
					</DropdownMenuItem>
				)}
				{onOpenSavedRecipes && savedRecipes > 0 && (
					<DropdownMenuItem onClick={onOpenSavedRecipes}>
						<ChefHat />
						Receitas salvas ({savedRecipes})
					</DropdownMenuItem>
				)}
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
	);
}

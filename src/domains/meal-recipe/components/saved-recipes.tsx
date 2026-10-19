"use client";

import Image from "next/image";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { kcalFor } from "~/domains/food";
import {
	deleteRecipeAction,
	restoreRecipeAction,
} from "~/domains/meal-recipe/actions/saved-recipe-actions";
import { RecipeView } from "~/domains/meal-recipe/components/recipe-view";
import type { SavedRecipe } from "~/domains/meal-recipe/types/saved-recipe-types";
import { recipeText } from "~/domains/meal-recipe/utils/meal-recipe";
import { mealChangedSince } from "~/domains/meal-recipe/utils/saved-recipe";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Clock, Copy, Loader2Icon, Trash2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { formatNumber } from "~/shared/lib/format";

interface SavedRecipesProps {
	initialRecipes: SavedRecipe[];
	/** Dieta atual: pra avisar quando a refeição de origem mudou. */
	meals: DietMeal[];
}

/** Chave do filtro: a refeição de origem (ou o nome, se ela foi apagada). */
const groupKey = (recipe: SavedRecipe) =>
	recipe.mealId ?? `nome:${recipe.mealName}`;

// "Minhas receitas": as receitas geradas pela IA que a pessoa salvou, com
// filtro por refeição (`?refeicao=`, vem do menu ⋮ da refeição na Dieta).
export function SavedRecipes({ initialRecipes, meals }: SavedRecipesProps) {
	const [recipes, setRecipes] = useState(initialRecipes);
	const [filter, setFilter] = useQueryState("refeicao", {
		history: "replace",
	});
	const [openId, setOpenId] = useState<string | null>(null);

	// Um chip por refeição, na ordem da dieta; as de refeições apagadas no fim.
	const groups = [
		...new Map(
			recipes.map((recipe) => [groupKey(recipe), recipe.mealName]),
		).entries(),
	].sort(([a], [b]) => mealOrder(meals, a) - mealOrder(meals, b));
	const activeFilter = groups.some(([key]) => key === filter) ? filter : null;
	const visible = activeFilter
		? recipes.filter((recipe) => groupKey(recipe) === activeFilter)
		: recipes;
	const open = recipes.find((recipe) => recipe.id === openId) ?? null;

	async function handleDelete(recipe: SavedRecipe) {
		setOpenId(null);
		setRecipes((list) => list.filter((entry) => entry.id !== recipe.id));
		const result = await deleteRecipeAction(recipe.id);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast(`"${recipe.title}" excluída.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: async () => {
					const restored = await restoreRecipeAction(recipe);
					if (!restored.ok) {
						toast.error(restored.error);
						return;
					}
					setRecipes((list) =>
						[...list, recipe].sort((a, b) =>
							b.createdAt.localeCompare(a.createdAt),
						),
					);
				},
			},
		});
	}

	if (recipes.length === 0) {
		return (
			<p className="rounded-3xl bg-card p-4 text-muted-foreground text-sm md:p-5">
				Nenhuma receita salva ainda. Na Dieta, abra o menu ⋮ de uma refeição,
				toque em <strong>Sugerir receita</strong> e salve as que gostar.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{groups.length > 1 && (
				<fieldset className="flex flex-wrap gap-2">
					<legend className="sr-only">Filtrar por refeição</legend>
					<Button
						size="sm"
						variant={activeFilter ? "outline" : "default"}
						aria-pressed={!activeFilter}
						onClick={() => setFilter(null)}
					>
						Todas
					</Button>
					{groups.map(([key, name]) => (
						<Button
							key={key}
							size="sm"
							variant={activeFilter === key ? "default" : "outline"}
							aria-pressed={activeFilter === key}
							onClick={() => setFilter(key)}
						>
							{name}
						</Button>
					))}
				</fieldset>
			)}

			<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{visible.map((recipe) => (
					<li key={recipe.id}>
						<button
							type="button"
							onClick={() => setOpenId(recipe.id)}
							className="flex h-full w-full flex-col gap-1.5 rounded-3xl bg-card p-4 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							{recipe.photo && (
								<span className="relative mb-1.5 block aspect-video overflow-hidden rounded-2xl bg-muted">
									<Image
										src={recipe.photo.url}
										alt=""
										fill
										unoptimized
										sizes="(min-width: 40rem) 20rem, 100vw"
										className="object-cover"
									/>
								</span>
							)}
							<span className="text-muted-foreground text-xs">
								{recipe.mealName}
							</span>
							<span className="text-balance font-heading font-semibold">
								{recipe.title}
							</span>
							<span className="line-clamp-2 text-pretty text-muted-foreground text-sm">
								{recipe.summary}
							</span>
							<span className="mt-auto flex items-center gap-1.5 pt-1 text-sm tabular-nums">
								<Clock className="size-3.5 text-muted-foreground" aria-hidden />
								{formatNumber(recipe.minutes)} min
								<span aria-hidden>·</span>
								{formatNumber(kcalFor(recipe.macros))} kcal
							</span>
						</button>
					</li>
				))}
			</ul>

			<SavedRecipeSheet
				recipe={open}
				meals={meals}
				onOpenChange={(next) => !next && setOpenId(null)}
				onDelete={handleDelete}
			/>
		</div>
	);
}

function mealOrder(meals: DietMeal[], key: string) {
	const index = meals.findIndex((meal) => meal.id === key);
	return index === -1 ? meals.length : index;
}

function SavedRecipeSheet({
	recipe,
	meals,
	onOpenChange,
	onDelete,
}: {
	recipe: SavedRecipe | null;
	meals: DietMeal[];
	onOpenChange: (open: boolean) => void;
	onDelete: (recipe: SavedRecipe) => Promise<void>;
}) {
	const [deleting, setDeleting] = useState(false);
	const origin = recipe?.mealId
		? meals.find((meal) => meal.id === recipe.mealId)
		: undefined;
	const changed =
		recipe && origin
			? mealChangedSince(recipe.ingredients, origin.items)
			: false;

	async function handleCopy(saved: SavedRecipe) {
		const items = saved.ingredients.map(({ name, unit, quantity }) => ({
			food: { name, unit },
			quantity,
		}));
		try {
			await navigator.clipboard.writeText(recipeText(saved, items));
			toast.success("Receita copiada.");
		} catch {
			toast.error("Não foi possível copiar.");
		}
	}

	return (
		<Sheet open={recipe !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[90svh] sm:max-w-2xl sm:data-[side=bottom]:h-[85svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Receita salva</SheetTitle>
					<SheetDescription>{recipe?.mealName}</SheetDescription>
				</SheetHeader>
				{recipe && (
					<>
						<div className="flex-1 overflow-y-auto px-4 pb-4">
							<RecipeView
								recipe={recipe}
								snapshot={recipe}
								notice={
									changed ? (
										<p className="rounded-2xl bg-muted px-3 py-2 text-muted-foreground text-xs">
											Sua refeição mudou desde que você salvou: confira as
											quantidades.
										</p>
									) : null
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-2 border-border border-t p-4">
							<Button variant="outline" onClick={() => handleCopy(recipe)}>
								<Copy data-icon="inline-start" />
								Copiar
							</Button>
							<Button
								variant="outline"
								className="text-destructive"
								disabled={deleting}
								onClick={async () => {
									setDeleting(true);
									await onDelete(recipe);
									setDeleting(false);
								}}
							>
								{deleting ? (
									<Loader2Icon
										data-icon="inline-start"
										className="animate-spin"
									/>
								) : (
									<Trash2 data-icon="inline-start" />
								)}
								Excluir
							</Button>
						</div>
					</>
				)}
			</BottomSheetContent>
		</Sheet>
	);
}

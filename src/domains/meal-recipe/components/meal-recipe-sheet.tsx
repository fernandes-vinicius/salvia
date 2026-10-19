"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { suggestRecipeAction } from "~/domains/meal-recipe/actions/meal-recipe-actions";
import { saveRecipeAction } from "~/domains/meal-recipe/actions/saved-recipe-actions";
import { RecipeShareSheet } from "~/domains/meal-recipe/components/recipe-share-sheet";
import { RecipeView } from "~/domains/meal-recipe/components/recipe-view";
import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import { recipeText } from "~/domains/meal-recipe/utils/meal-recipe";
import { recipeSnapshot } from "~/domains/meal-recipe/utils/saved-recipe";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	BookmarkCheck,
	BookmarkPlus,
	ChefHat,
	Loader2Icon,
	Share,
	Shuffle,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface MealRecipeSheetProps {
	meal: DietMeal | null;
	onOpenChange: (open: boolean) => void;
	/** Depois de salvar (atualiza o "Receitas salvas (N)" do menu). */
	onSaved?: (mealId: string) => void;
}

// "Sugerir receita (beta)" do menu da refeição: a IA monta uma receita com
// só os alimentos dela; "Outra receita" pede outra sem repetir e "Salvar"
// guarda em Minhas receitas.
export function MealRecipeSheet({
	meal,
	onOpenChange,
	onSaved,
}: MealRecipeSheetProps) {
	return (
		<Sheet open={meal !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[90svh] sm:max-w-2xl sm:data-[side=bottom]:h-[85svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Receita com a sua refeição</SheetTitle>
					<SheetDescription>{meal?.name}</SheetDescription>
				</SheetHeader>
				{/* Remontado a cada refeição: começa pedindo uma receita nova. */}
				{meal && <RecipeFlow key={meal.id} meal={meal} onSaved={onSaved} />}
			</BottomSheetContent>
		</Sheet>
	);
}

type State =
	| { kind: "loading"; previous: MealRecipe | null }
	/** `savedId`: a receita já está em Minhas receitas. */
	| { kind: "ready"; recipe: MealRecipe; savedId: string | null }
	| { kind: "error"; error: string };

function RecipeFlow({
	meal,
	onSaved,
}: {
	meal: DietMeal;
	onSaved?: (mealId: string) => void;
}) {
	const [state, setState] = useState<State>({
		kind: "loading",
		previous: null,
	});
	const [saving, setSaving] = useState(false);
	/** Id da receita salva com o painel de compartilhar aberto. */
	const [sharing, setSharing] = useState<string | null>(null);
	const avoid = useRef<string[]>([]);
	const started = useRef(false);

	async function suggest(previous: MealRecipe | null) {
		setState({ kind: "loading", previous });
		const result = await suggestRecipeAction({
			mealId: meal.id,
			avoid: avoid.current.slice(-10),
		});
		if (!result.ok) {
			setState({ kind: "error", error: result.error });
			return;
		}
		avoid.current.push(result.data.title);
		setState({ kind: "ready", recipe: result.data, savedId: null });
	}

	// Pede a primeira ao abrir (o ref evita pedir duas vezes no StrictMode).
	useEffect(() => {
		if (started.current) return;
		started.current = true;
		void suggest(null);
	});

	/** Salva e devolve o id (ou null se falhou). */
	async function save(recipe: MealRecipe, quiet = false) {
		setSaving(true);
		const result = await saveRecipeAction({ mealId: meal.id, recipe });
		setSaving(false);
		if (!result.ok) {
			toast.error(result.error);
			return null;
		}
		setState({ kind: "ready", recipe, savedId: result.data.id });
		onSaved?.(meal.id);
		if (!quiet) toast.success("Receita salva em Minhas receitas.");
		return result.data.id;
	}

	// O link público é de uma receita salva: compartilhar salva antes.
	async function handleShare(recipe: MealRecipe, savedId: string | null) {
		const id = savedId ?? (await save(recipe, true));
		if (id) setSharing(id);
	}

	const recipe =
		state.kind === "ready"
			? state.recipe
			: state.kind === "loading"
				? state.previous
				: null;
	const loading = state.kind === "loading";

	return (
		<>
			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{state.kind === "error" ? (
					<p role="alert" className="rounded-2xl bg-card p-4 text-sm">
						{state.error}
					</p>
				) : recipe ? (
					<div
						className={loading ? "opacity-50 transition-opacity" : undefined}
					>
						<RecipeView recipe={recipe} snapshot={recipeSnapshot(meal.items)} />
					</div>
				) : (
					<output className="flex flex-col items-center gap-3 py-12 text-center">
						<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary motion-safe:animate-bounce">
							<ChefHat className="size-7" aria-hidden />
						</span>
						<span className="font-heading font-semibold">
							Pensando numa receita…
						</span>
						<span className="text-muted-foreground text-sm">
							Só com o que já está na refeição.
						</span>
					</output>
				)}
			</div>
			<div className="flex flex-col gap-2 border-border border-t p-4">
				{state.kind === "ready" && state.savedId && (
					<Link
						href="/receitas"
						className="self-center font-medium text-primary text-sm underline-offset-4 hover:underline"
					>
						Ver minhas receitas
					</Link>
				)}
				<div className="grid grid-cols-2 gap-2 sm:flex">
					<Button
						className="col-span-2 sm:flex-1"
						disabled={loading || saving}
						onClick={() => suggest(recipe)}
					>
						{loading ? (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						) : (
							<Shuffle data-icon="inline-start" />
						)}
						{state.kind === "error" ? "Tentar de novo" : "Outra receita"}
					</Button>
					{state.kind === "ready" && (
						<>
							<Button
								variant="outline"
								disabled={state.savedId !== null || saving}
								onClick={() => save(state.recipe)}
							>
								{saving ? (
									<Loader2Icon
										data-icon="inline-start"
										className="animate-spin"
									/>
								) : state.savedId ? (
									<BookmarkCheck data-icon="inline-start" />
								) : (
									<BookmarkPlus data-icon="inline-start" />
								)}
								{state.savedId ? "Salva" : "Salvar"}
							</Button>
							<Button
								variant="outline"
								disabled={saving}
								onClick={() => handleShare(state.recipe, state.savedId)}
							>
								<Share data-icon="inline-start" />
								Compartilhar
							</Button>
						</>
					)}
				</div>
			</div>
			<RecipeShareSheet
				recipe={
					sharing && state.kind === "ready"
						? { id: sharing, ...state.recipe }
						: null
				}
				text={recipe ? recipeText(recipe, meal.items) : ""}
				onOpenChange={(open) => !open && setSharing(null)}
			/>
		</>
	);
}

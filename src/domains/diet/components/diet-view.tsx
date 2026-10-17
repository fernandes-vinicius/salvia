"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	type ActionResult,
	addItemAction,
	addMealAction,
	deleteItemAction,
	deleteMealAction,
	reorderMealsAction,
	updateMealAction,
} from "~/domains/diet/actions/diet-actions";
import { AddFoodSheet } from "~/domains/diet/components/add-food-sheet";
import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import { GoalProgress } from "~/domains/diet/components/goal-progress";
import { ItemSheet } from "~/domains/diet/components/item-sheet";
import { MealCard } from "~/domains/diet/components/meal-card";
import { MealEditSheet } from "~/domains/diet/components/meal-edit-sheet";
import type { DietMeal } from "~/domains/diet/types/diet-types";
import { nextMealName, summarizeDiet } from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import { Loader2Icon, Plus } from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Button } from "~/shared/components/ui/button";

interface DietViewProps {
	initialMeals: DietMeal[];
	weightKg: number | null;
	tdee: number | null;
	targets: GoalTargets | null;
}

/** Atualiza só a refeição `mealId`. */
function mapMeal(
	meals: DietMeal[],
	mealId: string,
	fn: (meal: DietMeal) => DietMeal,
) {
	return meals.map((meal) => (meal.id === mealId ? fn(meal) : meal));
}

export function DietView({
	initialMeals,
	weightKg,
	tdee,
	targets,
}: DietViewProps) {
	const router = useRouter();
	const [meals, setMeals] = useState(initialMeals);
	const [addingTo, setAddingTo] = useState<string | null>(null);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editingMealId, setEditingMealId] = useState<string | null>(null);
	const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
	const [addingMeal, setAddingMeal] = useState(false);

	const summary = summarizeDiet(meals, { weightKg, tdee });
	const findMeal = (id: string | null) =>
		meals.find((meal) => meal.id === id) ?? null;
	const editingItem =
		meals.flatMap((meal) => meal.items).find((i) => i.id === editingItemId) ??
		null;

	/**
	 * Erro "stale" = a dieta mudou em outra aba/aparelho (refeição ou item não
	 * existe mais): recarrega do servidor. A página remonta esta view com os
	 * dados novos (key pelos ids das refeições).
	 */
	function handleError(result: Extract<ActionResult<unknown>, { ok: false }>) {
		if (result.stale) {
			toast.info(
				"Sua dieta mudou em outra aba ou aparelho. Atualizamos a tela.",
			);
			router.refresh();
			return;
		}
		toast.error(result.error);
	}

	/** Aplica a mudança na hora e desfaz se o servidor recusar. */
	async function optimistic(
		next: (current: DietMeal[]) => DietMeal[],
		request: () => Promise<ActionResult<unknown>>,
	) {
		const previous = meals;
		setMeals(next);
		const result = await request();
		if (!result.ok) {
			setMeals(previous);
			handleError(result);
		}
	}

	async function handleAddMeal() {
		setAddingMeal(true);
		const result = await addMealAction(nextMealName(meals));
		setAddingMeal(false);
		if (result.ok) setMeals((current) => [...current, result.data]);
		else handleError(result);
	}

	async function handleAddFood(food: Food, quantity: number) {
		const mealId = addingTo;
		if (!mealId) return false;
		const result = await addItemAction({ mealId, foodId: food.id, quantity });
		if (!result.ok) {
			handleError(result);
			if (result.stale) setAddingTo(null);
			return false;
		}
		setMeals((current) =>
			mapMeal(current, mealId, (meal) => ({
				...meal,
				items: [...meal.items, result.data],
			})),
		);
		setAddingTo(null);
		return true;
	}

	function handleMove(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= meals.length) return;
		const reordered = [...meals];
		[reordered[index], reordered[target]] = [
			reordered[target],
			reordered[index],
		];
		optimistic(
			() => reordered,
			() => reorderMealsAction(reordered.map((meal) => meal.id)),
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 md:grid-cols-2 md:items-start">
				<DietSummaryCard summary={summary} tdee={tdee} />
				{targets ? (
					<GoalProgress summary={summary} targets={targets} />
				) : (
					<p className="rounded-3xl bg-card p-4 text-muted-foreground text-sm md:p-5">
						Defina sua meta na aba Meta para comparar o planejado com ela.
					</p>
				)}
			</div>

			<div className="flex flex-col gap-4">
				{meals.map((meal, index) => (
					<MealCard
						key={meal.id}
						meal={meal}
						isFirst={index === 0}
						isLast={index === meals.length - 1}
						canDelete={meals.length > 1}
						onAddFood={() => setAddingTo(meal.id)}
						onEditItem={setEditingItemId}
						onEdit={() => setEditingMealId(meal.id)}
						onMove={(direction) => handleMove(index, direction)}
						onDelete={() => setDeletingMealId(meal.id)}
					/>
				))}
				<Button
					variant="secondary"
					size="lg"
					disabled={addingMeal}
					onClick={handleAddMeal}
				>
					{addingMeal ? (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					) : (
						<Plus data-icon="inline-start" />
					)}
					Adicionar refeição
				</Button>
			</div>

			<AddFoodSheet
				meal={findMeal(addingTo)}
				onOpenChange={(open) => !open && setAddingTo(null)}
				onAdd={handleAddFood}
			/>

			<ItemSheet
				item={editingItem}
				onOpenChange={(open) => !open && setEditingItemId(null)}
				onStale={() => {
					setEditingItemId(null);
					handleError({ ok: false, error: "", stale: true });
				}}
				onQuantityChange={(itemId, quantity) =>
					setMeals((current) =>
						current.map((meal) => ({
							...meal,
							items: meal.items.map((item) =>
								item.id === itemId ? { ...item, quantity } : item,
							),
						})),
					)
				}
				onDelete={(itemId) => {
					setEditingItemId(null);
					optimistic(
						(current) =>
							current.map((meal) => ({
								...meal,
								items: meal.items.filter((item) => item.id !== itemId),
							})),
						() => deleteItemAction(itemId),
					);
				}}
			/>

			<MealEditSheet
				meal={findMeal(editingMealId)}
				onOpenChange={(open) => !open && setEditingMealId(null)}
				onSave={(data) => {
					const mealId = editingMealId;
					if (!mealId) return;
					setEditingMealId(null);
					optimistic(
						(current) =>
							mapMeal(current, mealId, (meal) => ({ ...meal, ...data })),
						() => updateMealAction(mealId, data),
					);
				}}
			/>

			<AlertDialog
				open={deletingMealId !== null}
				onOpenChange={(open) => !open && setDeletingMealId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Remover {findMeal(deletingMealId)?.name}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							A refeição e os alimentos dela saem do seu plano.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={() => {
								const mealId = deletingMealId;
								setDeletingMealId(null);
								if (!mealId) return;
								optimistic(
									(current) => current.filter((meal) => meal.id !== mealId),
									() => deleteMealAction(mealId),
								);
							}}
						>
							Remover
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

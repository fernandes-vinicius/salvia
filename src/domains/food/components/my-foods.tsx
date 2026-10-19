"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteFoodAction } from "~/domains/food/actions/food-actions";
import { CustomFoodForm } from "~/domains/food/components/custom-food-form";
import { MacroLine } from "~/domains/food/components/macro-line";
import type { CustomFoodSummary, Food } from "~/domains/food/types/food-types";
import { macrosFor, UNIT_LABELS } from "~/domains/food/utils/food";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { PackagePlus, Pencil, Trash2 } from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

type Editing = { kind: "new" } | { kind: "edit"; food: CustomFoodSummary };

function usageLabel(meals: number) {
	if (meals === 0) return "Não está na sua dieta";
	return meals === 1 ? "Em 1 refeição" : `Em ${meals} refeições`;
}

// Alimentos cadastrados pelo usuário: ver, editar, excluir e cadastrar.
export function MyFoods({
	initialFoods,
}: {
	initialFoods: CustomFoodSummary[];
}) {
	const [foods, setFoods] = useState(initialFoods);
	const [editing, setEditing] = useState<Editing | null>(null);
	const [deleting, setDeleting] = useState<CustomFoodSummary | null>(null);

	function handleSaved(saved: Food) {
		setFoods((current) => {
			const exists = current.some((food) => food.id === saved.id);
			const next = exists
				? current.map((food) =>
						food.id === saved.id ? { ...food, ...saved } : food,
					)
				: [...current, { ...saved, usedInMeals: 0 }];
			return next.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
		});
		setEditing(null);
	}

	async function handleDelete(food: CustomFoodSummary) {
		setDeleting(null);
		const previous = foods;
		setFoods((current) => current.filter((item) => item.id !== food.id));
		const result = await deleteFoodAction(food.id);
		if (result.ok) {
			toast.success(`${food.name} excluído.`);
		} else {
			setFoods(previous);
			toast.error(result.error);
		}
	}

	const editingFood = editing?.kind === "edit" ? editing.food : undefined;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-muted-foreground text-sm">
					{foods.length === 1
						? "1 alimento cadastrado"
						: `${foods.length} alimentos cadastrados`}
				</p>
				<Button onClick={() => setEditing({ kind: "new" })}>
					<PackagePlus data-icon="inline-start" />
					Cadastrar alimento
				</Button>
			</div>

			{foods.length === 0 ? (
				<p className="rounded-2xl bg-card p-4 text-muted-foreground text-sm">
					Você ainda não cadastrou alimentos. Cadastre aqui (ex.: o whey da sua
					marca, pelo rótulo) ou pela aba Dieta, em “Não achou? Cadastrar
					alimento”.
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{foods.map((food) => (
						<li
							key={food.id}
							className="flex items-center gap-3 rounded-2xl bg-card p-4"
						>
							<div className="flex min-w-0 flex-1 flex-col gap-1">
								<div className="flex items-center gap-2">
									<span className="truncate font-medium text-sm">
										{food.name}
									</span>
									<Badge variant="secondary">
										{food.proteinSource === "animal" ? "Animal" : "Vegetal"}
									</Badge>
								</div>
								<div className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground text-xs">
									<span>Em {UNIT_LABELS[food.unit].base}:</span>
									<MacroLine
										macros={macrosFor(food, food.unit === "unit" ? 1 : 100)}
									/>
								</div>
								<span className="text-muted-foreground text-xs">
									{usageLabel(food.usedInMeals)}
								</span>
							</div>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Editar ${food.name}`}
								onClick={() => setEditing({ kind: "edit", food })}
							>
								<Pencil />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-destructive"
								aria-label={`Excluir ${food.name}`}
								onClick={() => setDeleting(food)}
							>
								<Trash2 />
							</Button>
						</li>
					))}
				</ul>
			)}

			<Sheet
				open={editing !== null}
				onOpenChange={(open) => !open && setEditing(null)}
			>
				<BottomSheetContent>
					<SheetHeader className="text-center">
						<SheetTitle>
							{editingFood ? "Editar alimento" : "Cadastrar alimento"}
						</SheetTitle>
						<SheetDescription>
							Macros do rótulo. Mudanças valem para todas as refeições que usam
							este alimento.
						</SheetDescription>
					</SheetHeader>
					{editing && (
						<div className="flex-1 overflow-y-auto p-4">
							<CustomFoodForm
								key={editingFood?.id ?? "new"}
								food={editingFood}
								unitLocked={(editingFood?.usedInMeals ?? 0) > 0}
								cancelLabel="Cancelar"
								onSaved={handleSaved}
								onCancel={() => setEditing(null)}
							/>
						</div>
					)}
				</BottomSheetContent>
			</Sheet>

			<AlertDialog
				open={deleting !== null}
				onOpenChange={(open) => !open && setDeleting(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir {deleting?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleting && deleting.usedInMeals > 0
								? `Ele também sai da sua dieta (${usageLabel(deleting.usedInMeals).toLowerCase()}).`
								: "Ele não está na sua dieta."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={() => deleting && handleDelete(deleting)}
						>
							Excluir
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

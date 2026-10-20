"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId } from "react";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { moveMeal } from "~/domains/diet/utils/diet";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	ArrowDown,
	ArrowUp,
	Clock,
	GripVertical,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { cn } from "~/shared/lib/utils";

interface ReorderMealsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	meals: DietMeal[];
	/** Nova ordem (otimista: a tela muda na hora e salva em seguida). */
	onReorder: (meals: DietMeal[]) => void;
}

// "Reordenar refeições" (menu ⋮ da Dieta): lista só com os nomes, arrastando
// pela alça ou com as setas (teclado e leitor de tela). Fica num painel à
// parte pra não misturar com o arrastar dos alimentos na grade.
export function ReorderMealsSheet({
	open,
	onOpenChange,
	meals,
	onReorder,
}: ReorderMealsSheetProps) {
	const dndId = useId();
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd({ active, over }: DragEndEvent) {
		if (!over) return;
		const next = moveMeal(meals, String(active.id), String(over.id));
		if (next !== meals) onReorder(next);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<BottomSheetContent className="sm:max-w-lg">
				<SheetHeader className="text-center">
					<SheetTitle>Reordenar refeições</SheetTitle>
					<SheetDescription>
						Arraste pela alça ou use as setas. Salva sozinho.
					</SheetDescription>
				</SheetHeader>
				<div className="overflow-y-auto px-4 pb-6">
					<DndContext
						id={dndId}
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={meals.map((meal) => meal.id)}
							strategy={verticalListSortingStrategy}
						>
							<ol className="flex flex-col gap-2">
								{meals.map((meal, index) => (
									<SortableMeal
										key={meal.id}
										meal={meal}
										isFirst={index === 0}
										isLast={index === meals.length - 1}
										onMove={(offset) =>
											onReorder(
												moveMeal(meals, meal.id, meals[index + offset].id),
											)
										}
									/>
								))}
							</ol>
						</SortableContext>
					</DndContext>
				</div>
			</BottomSheetContent>
		</Sheet>
	);
}

function SortableMeal({
	meal,
	isFirst,
	isLast,
	onMove,
}: {
	meal: DietMeal;
	isFirst: boolean;
	isLast: boolean;
	onMove: (offset: -1 | 1) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: meal.id });

	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			className={cn(
				"flex items-center gap-2 rounded-2xl bg-card p-2 ring-1 ring-foreground/5",
				isDragging && "relative z-10 opacity-80",
			)}
		>
			<button
				ref={setActivatorNodeRef}
				type="button"
				aria-label={`Arrastar ${meal.name}`}
				className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-4" />
			</button>
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium">{meal.name}</span>
				{meal.time && (
					<span className="flex items-center gap-1 text-muted-foreground text-xs tabular-nums">
						<Clock className="size-3" aria-hidden />
						{meal.time}
					</span>
				)}
			</span>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Subir ${meal.name}`}
				disabled={isFirst}
				onClick={() => onMove(-1)}
			>
				<ArrowUp />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Descer ${meal.name}`}
				disabled={isLast}
				onClick={() => onMove(1)}
			>
				<ArrowDown />
			</Button>
		</li>
	);
}

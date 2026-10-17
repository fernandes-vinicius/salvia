"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { DietItem } from "~/domains/diet/types/diet-types";
import { itemMacros } from "~/domains/diet/utils/diet";
import { kcalFor, UNIT_LABELS } from "~/domains/food/utils/food";
import { GripVertical } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface SortableItemRowProps {
	item: DietItem;
	onEdit: () => void;
}

// Linha da grade arrastável pela alça (⋮⋮): a alça tem `touch-none` pra o
// arrasto no celular não brigar com a rolagem, e tocar no resto da linha
// continua abrindo o painel de edição.
export function SortableItemRow({ item, onEdit }: SortableItemRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const macros = itemMacros(item);
	const protein = macros.proteinAnimal + macros.proteinVegetal;
	const isAnimal = item.food.proteinSource === "animal";

	return (
		<tr
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			className={cn(
				"cursor-pointer border-border border-t transition-colors hover:bg-accent",
				isDragging && "opacity-40",
			)}
			onClick={onEdit}
		>
			<td className="w-5 py-2 pr-1 align-middle">
				<button
					ref={setActivatorNodeRef}
					type="button"
					aria-label={`Arrastar ${item.food.name}`}
					className="-ml-1.5 flex cursor-grab touch-none items-center rounded-md p-1 text-muted-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
					onClick={(event) => event.stopPropagation()}
					{...attributes}
					{...listeners}
				>
					<GripVertical className="size-4" />
				</button>
			</td>
			<td className="max-w-0 py-2 pr-2">
				<button
					type="button"
					title={item.food.name}
					className="line-clamp-2 w-full text-left leading-snug outline-none focus-visible:underline"
					onClick={(event) => {
						event.stopPropagation();
						onEdit();
					}}
				>
					{item.food.name}
				</button>
				<span className="text-muted-foreground text-xs">
					{formatNumber(item.quantity, 1)} {UNIT_LABELS[item.food.unit].short}
				</span>
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
				{formatNumber(protein)}
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
}

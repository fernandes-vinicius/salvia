"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { updateItemQuantityAction } from "~/domains/diet/actions/diet-actions";
import type { DietItem } from "~/domains/diet/types/diet-types";
import { MacroLine, macrosFor, QuantityEditor } from "~/domains/food";
import { Trash2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { useAutosave } from "~/shared/hooks/use-autosave";

interface ItemSheetProps {
	item: DietItem | null;
	onOpenChange: (open: boolean) => void;
	/** O item não existe mais no servidor (mudou em outra aba/aparelho). */
	onStale: () => void;
	onQuantityChange: (itemId: string, quantity: number) => void;
	onDelete: (itemId: string) => void;
}

export function ItemSheet({
	item,
	onOpenChange,
	onStale,
	onQuantityChange,
	onDelete,
}: ItemSheetProps) {
	return (
		<Sheet open={item !== null} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full gap-0 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>{item?.food.name ?? "Alimento"}</SheetTitle>
					<SheetDescription>
						{item?.food.source === "taco"
							? "Tabela TACO"
							: "Alimento cadastrado por você"}
					</SheetDescription>
				</SheetHeader>
				{item && (
					<ItemEditor
						key={item.id}
						item={item}
						onStale={onStale}
						onQuantityChange={onQuantityChange}
						onDelete={onDelete}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}

// Quantidade salva sozinha (autosave com debounce; o pendente é salvo ao
// fechar o painel, que desmonta este componente).
function ItemEditor({
	item,
	onStale,
	onQuantityChange,
	onDelete,
}: {
	item: DietItem;
	onStale: ItemSheetProps["onStale"];
	onQuantityChange: ItemSheetProps["onQuantityChange"];
	onDelete: ItemSheetProps["onDelete"];
}) {
	const { status, schedule } = useAutosave<number>({
		save: async (quantity) => {
			const result = await updateItemQuantityAction(item.id, quantity);
			if (!result.ok && result.stale) {
				// O painel fecha e a tela recarrega; não mostra o toast de erro
				// do autosave além do aviso de atualização.
				onStale();
				return true;
			}
			return result.ok;
		},
	});

	useEffect(() => {
		if (status === "error") {
			toast.error("Não foi possível salvar a quantidade. Tente de novo.");
		}
	}, [status]);

	return (
		<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
			<MacroLine macros={macrosFor(item.food, item.quantity)} />
			<QuantityEditor
				unit={item.food.unit}
				value={item.quantity}
				onChange={(quantity) => {
					onQuantityChange(item.id, quantity);
					schedule(quantity);
				}}
			/>
			<Button
				variant="destructive"
				className="mt-auto"
				onClick={() => onDelete(item.id)}
			>
				<Trash2 data-icon="inline-start" />
				Remover da refeição
			</Button>
		</div>
	);
}

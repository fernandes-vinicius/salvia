"use client";

import { useDroppable } from "@dnd-kit/core";

import { Trash2 } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

export const TRASH_ID = "trash";

// Aparece no rodapé enquanto um alimento é arrastado: soltar aqui remove.
export function TrashZone({ visible }: { visible: boolean }) {
	const { setNodeRef, isOver } = useDroppable({ id: TRASH_ID });

	return (
		<div
			ref={setNodeRef}
			aria-hidden={!visible}
			className={cn(
				"fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-50 flex w-max -translate-x-1/2 items-center gap-2 rounded-full border-2 border-destructive/40 border-dashed bg-card px-6 py-4 font-medium text-destructive text-sm transition-all duration-200",
				visible ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0",
				isOver && "scale-110 border-solid bg-destructive text-white",
			)}
		>
			<Trash2 className="size-4" />
			{isOver ? "Solte para remover" : "Arraste aqui para remover"}
		</div>
	);
}

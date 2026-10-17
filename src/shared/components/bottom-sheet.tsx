"use client";

import type { ComponentProps } from "react";

import { SheetContent } from "~/shared/components/ui/sheet";
import { cn } from "~/shared/lib/utils";

// Painel que sobe de baixo (padrão do listify): centralizado, largura de
// formulário e cantos superiores arredondados. A altura acompanha o conteúdo
// até 92% da tela. Pra fixar a altura use `data-[side=bottom]:h-[…]` (o
// SheetContent já aplica `data-[side=bottom]:h-auto`, que vence um `h-` simples).
export function BottomSheetContent({
	className,
	children,
	...props
}: Omit<ComponentProps<typeof SheetContent>, "side">) {
	return (
		<SheetContent
			side="bottom"
			className={cn(
				"mx-auto flex max-h-[92svh] w-full max-w-xl flex-col gap-0 rounded-t-3xl",
				className,
			)}
			{...props}
		>
			<div
				aria-hidden
				className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted"
			/>
			{children}
		</SheetContent>
	);
}

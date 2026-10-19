import type { ReactNode } from "react";

import type { LucideIcon } from "~/shared/components/icons";

interface StatusScreenProps {
	icon: LucideIcon;
	/** "404" etc., discreto acima do título. */
	code?: string;
	title: string;
	description: ReactNode;
	/** Botões (no celular um embaixo do outro). */
	children: ReactNode;
}

// Tela cheia de aviso (página não encontrada, erro): ícone, título, texto
// curto e o caminho de volta. Sem estado: serve pra not-found (servidor) e
// error boundaries (client).
export function StatusScreen({
	icon: Icon,
	code,
	title,
	description,
	children,
}: StatusScreenProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
			<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
				<Icon className="size-7" aria-hidden />
			</span>
			{code && (
				<p className="font-heading font-semibold text-muted-foreground text-sm tabular-nums tracking-widest">
					{code}
				</p>
			)}
			<h1 className="text-balance font-heading font-semibold text-2xl sm:text-3xl">
				{title}
			</h1>
			<p className="max-w-md text-pretty text-muted-foreground">
				{description}
			</p>
			<div className="flex w-full flex-col gap-2 pt-2 sm:w-auto sm:flex-row">
				{children}
			</div>
		</div>
	);
}

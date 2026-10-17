import type { ReactNode } from "react";

import { cn } from "~/shared/lib/utils";

// Moldura das telas reais na landing: fundo sálvia claro em volta dos
// componentes do app. `inert` deixa a tela só de vitrine (sem foco, clique ou
// leitor de tela entrando nos controles); `label` descreve o que ela mostra.
export function ShowcaseFrame({
	label,
	className,
	children,
}: {
	label: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<figure
			aria-label={label}
			className={cn(
				"flex min-w-0 flex-col gap-3 rounded-[2rem] bg-secondary/60 p-3 sm:p-4",
				className,
			)}
		>
			<div inert className="flex min-w-0 select-none flex-col gap-3">
				{children}
			</div>
		</figure>
	);
}

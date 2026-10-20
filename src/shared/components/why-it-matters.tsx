import Link from "next/link";
import type { ReactNode } from "react";

import { ChevronDown, Lightbulb } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

interface WhyItMattersProps {
	children: ReactNode;
	/** Valor escolhido fora da faixa: o título vira "Vale conferir". */
	attention?: boolean;
	className?: string;
}

// "Por que isso importa?": dica curta e recolhida ao lado de uma escolha da
// TMB ou da Meta, em linguagem simples. Não bloqueia nada.
export function WhyItMatters({
	children,
	attention = false,
	className,
}: WhyItMattersProps) {
	return (
		<details
			className={cn(
				"group rounded-2xl bg-secondary/60 text-sm open:bg-secondary",
				className,
			)}
		>
			<summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl px-4 py-2.5 font-medium text-secondary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
				<Lightbulb className="size-4 shrink-0 text-primary" aria-hidden />
				<span className="flex-1">
					{attention
						? "Vale conferir: por que isso importa?"
						: "Por que isso importa?"}
				</span>
				<ChevronDown
					className="size-4 shrink-0 transition-transform group-open:rotate-180"
					aria-hidden
				/>
			</summary>
			<div className="flex flex-col gap-2 text-pretty px-4 pb-3 text-secondary-foreground leading-relaxed">
				{children}
				<p className="text-muted-foreground text-xs">
					Referências em{" "}
					<Link
						href="/como-calculamos"
						className="font-medium text-foreground underline underline-offset-4"
					>
						Como calculamos
					</Link>
					. Não substitui nutricionista.
				</p>
			</div>
		</details>
	);
}

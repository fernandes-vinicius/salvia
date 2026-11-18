"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useTransition } from "react";

import { Pencil } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

const VERSIONS = ["rascunho"] as const;

/** `?versao=rascunho` abre o rascunho; sem ela, a dieta atual. */
export function useDietVersion() {
	const [pending, startTransition] = useTransition();
	const [version, setVersion] = useQueryState(
		"versao",
		parseAsStringLiteral(VERSIONS).withOptions({
			shallow: false,
			history: "replace",
			scroll: false,
			startTransition,
		}),
	);
	return {
		draft: version === "rascunho",
		pending,
		showDraft: () => setVersion("rascunho"),
		showActive: () => setVersion(null),
	};
}

interface DietVariantSwitchProps {
	/** Mostrando o rascunho (o servidor já leu a versão certa). */
	draft: boolean;
	/** Quantas mudanças o rascunho tem (selo no botão). */
	changes: number;
}

// "Atual | Rascunho" no topo da Dieta, quando há um rascunho.
export function DietVariantSwitch({ draft, changes }: DietVariantSwitchProps) {
	const { pending, showActive, showDraft } = useDietVersion();
	const option =
		"flex h-9 items-center justify-center gap-1.5 rounded-full px-4 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50";
	return (
		<fieldset
			aria-busy={pending}
			className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
		>
			<legend className="sr-only">Qual dieta ver</legend>
			<button
				type="button"
				aria-pressed={!draft}
				onClick={showActive}
				className={cn(
					option,
					draft ? "text-muted-foreground hover:text-foreground" : "bg-card",
				)}
			>
				Atual
			</button>
			<button
				type="button"
				aria-pressed={draft}
				onClick={showDraft}
				className={cn(
					option,
					draft ? "bg-card" : "text-muted-foreground hover:text-foreground",
				)}
			>
				<Pencil className="size-3.5" aria-hidden />
				Rascunho
				{changes > 0 && (
					<span className="rounded-full bg-macro-carb px-1.5 text-foreground text-xs tabular-nums">
						{changes}
					</span>
				)}
			</button>
		</fieldset>
	);
}

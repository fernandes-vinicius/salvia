"use client";

import { useState } from "react";

import { suggestCheaperSwapAction } from "~/domains/cheaper-swap/actions/cheaper-swap-actions";
import { CheaperSwapCard } from "~/domains/cheaper-swap/components/cheaper-swap-card";
import type { CheaperSwapSuggestion } from "~/domains/cheaper-swap/schemas/cheaper-swap-schema";
import type { DietItem } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import { Loader2Icon, PiggyBank } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

// Sugestões já buscadas nesta visita (item × alimento): pedir de novo pro
// mesmo alimento não chama a IA outra vez.
const cache = new Map<string, Promise<CheaperSwapSuggestion | null>>();

function fetchSuggestion(key: string, itemId: string) {
	let pending = cache.get(key);
	if (!pending) {
		pending = suggestCheaperSwapAction({ itemId }).catch(() => null);
		cache.set(key, pending);
	}
	return pending;
}

type State =
	| { kind: "idle" }
	| { kind: "loading" }
	| { kind: "done"; value: CheaperSwapSuggestion | null };

/**
 * "Achar troca mais barata" (beta): só busca quando a pessoa pede, com
 * carregando e um aviso quando não há opção mais barata (antes buscava
 * sozinho e a pessoa ficava sem saber se ia aparecer).
 */
export function CheaperSwapSuggestionCard({
	item,
	onReplace,
}: {
	item: DietItem;
	onReplace: (food: Food, quantity: number) => Promise<boolean>;
}) {
	// O alimento entra na chave: depois de trocar, volta pro botão.
	const key = `${item.id}:${item.food.id}`;
	const [state, setState] = useState<{ key: string; state: State }>({
		key,
		state: { kind: "idle" },
	});
	const current = state.key === key ? state.state : { kind: "idle" as const };

	async function search() {
		setState({ key, state: { kind: "loading" } });
		const value = await fetchSuggestion(key, item.id);
		setState({ key, state: { kind: "done", value } });
	}

	if (current.kind === "done" && current.value) {
		return (
			<CheaperSwapCard
				item={item}
				food={current.value.food}
				insight={current.value.insight}
				onReplace={onReplace}
			/>
		);
	}

	if (current.kind === "done") {
		return (
			<output className="flex items-start gap-2.5 rounded-2xl bg-muted/60 p-3 text-sm">
				<PiggyBank
					className="mt-0.5 size-4 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<span className="text-pretty">
					<strong className="font-medium">Esse já está em conta.</strong>{" "}
					<span className="text-muted-foreground">
						Não achamos nada mais barato com macros parecidos.
					</span>
				</span>
			</output>
		);
	}

	return (
		<Button
			variant="outline"
			className="self-start"
			disabled={current.kind === "loading"}
			onClick={search}
		>
			{current.kind === "loading" ? (
				<Loader2Icon data-icon="inline-start" className="animate-spin" />
			) : (
				<PiggyBank data-icon="inline-start" />
			)}
			{current.kind === "loading"
				? "Procurando opção mais barata…"
				: "Tem opção mais barata?"}
			{current.kind === "idle" && (
				<span className="rounded-full bg-secondary px-1.5 py-0.5 font-medium text-[0.65rem] text-secondary-foreground uppercase leading-none tracking-wide">
					Beta
				</span>
			)}
		</Button>
	);
}

"use client";

import { useEffect, useState } from "react";

import { suggestCheaperSwapAction } from "~/domains/cheaper-swap/actions/cheaper-swap-actions";
import { CheaperSwapCard } from "~/domains/cheaper-swap/components/cheaper-swap-card";
import type { CheaperSwapSuggestion } from "~/domains/cheaper-swap/schemas/cheaper-swap-schema";
import type { DietItem } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";

// Sugestões já buscadas nesta visita (item × alimento): abrir o mesmo
// alimento de novo não chama a IA outra vez.
const cache = new Map<string, Promise<CheaperSwapSuggestion | null>>();

function fetchSuggestion(key: string, itemId: string) {
	let pending = cache.get(key);
	if (!pending) {
		pending = suggestCheaperSwapAction({ itemId }).catch(() => null);
		cache.set(key, pending);
	}
	return pending;
}

/**
 * Busca a troca mais em conta ao abrir o alimento (beta). Enquanto busca, ou
 * sem troca mais barata, não mostra nada.
 */
export function CheaperSwapSuggestionCard({
	item,
	onReplace,
}: {
	item: DietItem;
	onReplace: (food: Food, quantity: number) => Promise<boolean>;
}) {
	const [suggestion, setSuggestion] = useState<{
		key: string;
		value: CheaperSwapSuggestion | null;
	} | null>(null);
	// O alimento entra na chave: depois de trocar, busca de novo.
	const key = `${item.id}:${item.food.id}`;
	const itemId = item.id;

	useEffect(() => {
		let active = true;
		fetchSuggestion(key, itemId).then((value) => {
			if (active) setSuggestion({ key, value });
		});
		return () => {
			active = false;
		};
	}, [key, itemId]);

	const current = suggestion?.key === key ? suggestion.value : null;
	if (!current) return null;
	return (
		<CheaperSwapCard
			item={item}
			food={current.food}
			insight={current.insight}
			onReplace={onReplace}
		/>
	);
}

"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { Food } from "~/domains/food/types/food-types";
import type { Price } from "~/domains/shopping/data/reference-prices";
import {
	costChangeLabel,
	costChangeShort,
	formatMoney,
	swapCost,
} from "~/domains/shopping/utils/prices";
import { Wallet } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

// Preços da pessoa (tabela `user_price`) pra mostrar o custo das trocas na
// Dieta (Substituir, Opções, Variar refeição). Sem provider, só referência.
const PricesContext = createContext<ReadonlyMap<string, Price>>(new Map());

export function PricesProvider({
	prices,
	children,
}: {
	/** `[chave, preço]` (serializável, vem do servidor). */
	prices: [string, Price][];
	children: ReactNode;
}) {
	const map = useMemo(() => new Map(prices), [prices]);
	return <PricesContext value={map}>{children}</PricesContext>;
}

/** Os preços da pessoa (vazio fora do provider: só referência). */
export const usePrices = () => useContext(PricesContext);

interface Portion {
	food: Food;
	quantity: number;
}

/** "Custo: R$ 1,40 → R$ 2,70 por dia · +R$ 1,30 por dia (≈ R$ 39 a mais por mês)". */
export function SwapCostLine({
	from,
	to,
	className,
}: {
	from: Portion;
	to: Portion;
	className?: string;
}) {
	const cost = swapCost(from, to, useContext(PricesContext));
	if (!cost) return null;
	return (
		<p
			className={cn(
				"flex items-start gap-2 text-muted-foreground text-xs",
				className,
			)}
		>
			<Wallet className="mt-px size-3.5 shrink-0" aria-hidden />
			<span className="text-pretty">
				Custo: {formatMoney(cost.before)} → {formatMoney(cost.after)} por dia ·{" "}
				<strong className="font-medium text-foreground">
					{costChangeLabel(cost.delta)}
				</strong>
			</span>
		</p>
	);
}

/** Versão curta ("+R$ 0,20/dia"), pra listas. Nada sem preço. */
export function SwapCostBadge({ from, to }: { from: Portion; to: Portion }) {
	const cost = swapCost(from, to, useContext(PricesContext));
	if (!cost) return null;
	return (
		<span className="text-muted-foreground text-xs tabular-nums">
			{costChangeShort(cost.delta)}
		</span>
	);
}

/** Soma da diferença de custo de várias trocas (null se faltar preço). */
export function useSwapsCost(pairs: { from: Portion; to: Portion }[]) {
	const prices = useContext(PricesContext);
	let delta = 0;
	for (const pair of pairs) {
		const cost = swapCost(pair.from, pair.to, prices);
		if (!cost) return null;
		delta += cost.delta;
	}
	return delta;
}

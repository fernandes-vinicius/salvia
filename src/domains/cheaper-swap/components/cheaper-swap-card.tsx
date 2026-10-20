"use client";

import { useEffect, useState } from "react";

import {
	cheaperSwap,
	monthlySaving,
} from "~/domains/cheaper-swap/utils/cheaper-swap";
import type { DietItem } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { usePrices } from "~/domains/shopping/components/prices-context";
import { formatMoney } from "~/domains/shopping/utils/prices";
import { Loader2Icon, PiggyBank, Sparkles } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";
import { formatNumber } from "~/shared/lib/format";

type Portion = Pick<DietItem, "food" | "quantity">;

/**
 * "Economize ≈ R$ 37 por mês: troque por 100 g de banana". A quantidade e a
 * economia saem da quantidade atual do item (muda se a pessoa ajustar).
 */
export function CheaperSwapCard({
	item,
	food,
	insight,
	onReplace,
}: {
	item: Portion;
	food: Food;
	insight: string | null;
	onReplace: (food: Food, quantity: number) => Promise<boolean>;
}) {
	const [pending, setPending] = useState(false);
	const swap = cheaperSwap(item, food, usePrices());
	const month = swap ? monthlySaving(swap.saving) : 0;

	// Uma vez por sugestão, não a cada ajuste de quantidade.
	// biome-ignore lint/correctness/useExhaustiveDependencies: só ao trocar de alimento
	useEffect(() => {
		if (month > 0) {
			analytics.track("troca_economica_vista", {
				alimento: item.food.name,
				troca: food.name,
				economia_mes: month,
			});
		}
	}, [item.food.name, food.name]);

	if (!swap || month === 0) return null;
	return (
		<section
			aria-labelledby="cheaper-swap"
			className="motion-safe:fade-in flex flex-col gap-3 rounded-2xl bg-secondary p-3 text-secondary-foreground motion-safe:animate-in"
		>
			<div className="flex items-start gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
					<PiggyBank className="size-5" aria-hidden />
				</span>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<h3
						id="cheaper-swap"
						className="font-heading font-semibold text-sm tabular-nums"
					>
						Economize ≈ R$ {month} por mês
					</h3>
					<p className="text-pretty text-sm">
						Troque por{" "}
						<strong className="font-medium">
							{formatNumber(swap.quantity, 1)} {UNIT_LABELS[food.unit].short} de{" "}
							{food.name}
						</strong>
						, com os mesmos macros.
					</p>
					{insight && <p className="text-pretty text-sm">{insight}</p>}
					<p className="text-muted-foreground text-xs tabular-nums">
						{formatMoney(swap.before)} → {formatMoney(swap.after)} por dia
					</p>
				</div>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span className="flex items-center gap-1 text-muted-foreground text-xs">
					<Sparkles className="size-3.5" aria-hidden />
					Sugestão com IA (beta)
				</span>
				<Button
					size="sm"
					disabled={pending}
					onClick={async () => {
						setPending(true);
						const ok = await onReplace(food, swap.quantity);
						if (ok) {
							analytics.track("troca_economica_usada", {
								alimento: item.food.name,
								troca: food.name,
								economia_mes: month,
							});
						} else {
							setPending(false);
						}
					}}
				>
					{pending && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					Trocar
				</Button>
			</div>
		</section>
	);
}

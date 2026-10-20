"use client";

import { useEffect, useRef, useState } from "react";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { suggestVariationAction } from "~/domains/meal-variation/actions/meal-variation-actions";
import { MealVariationView } from "~/domains/meal-variation/components/meal-variation-view";
import type { MealVariation } from "~/domains/meal-variation/schemas/meal-variation-schema";
import { variationKey } from "~/domains/meal-variation/utils/meal-variation";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Check, Loader2Icon, Shuffle } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { analytics } from "~/shared/lib/analytics/analytics";

interface MealVariationSheetProps {
	meal: DietMeal | null;
	onOpenChange: (open: boolean) => void;
	/** "Usar esta": troca na dieta (com Desfazer); true fecha o painel. */
	onUse: (mealId: string, variation: MealVariation) => Promise<boolean>;
}

// "Variar refeição (beta)" do menu da refeição: a IA monta outra versão com
// trocas equivalentes; nada muda na dieta até tocar em "Usar esta".
export function MealVariationSheet({
	meal,
	onOpenChange,
	onUse,
}: MealVariationSheetProps) {
	return (
		<Sheet open={meal !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[85svh] sm:max-w-2xl sm:data-[side=bottom]:h-[80svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Outra versão da refeição</SheetTitle>
					<SheetDescription>{meal?.name}</SheetDescription>
				</SheetHeader>
				{/* Remontado a cada refeição: começa pedindo uma versão nova. */}
				{meal && <VariationFlow key={meal.id} meal={meal} onUse={onUse} />}
			</BottomSheetContent>
		</Sheet>
	);
}

type State =
	| { kind: "loading"; previous: MealVariation | null }
	| { kind: "ready"; variation: MealVariation }
	| { kind: "error"; error: string };

function VariationFlow({
	meal,
	onUse,
}: {
	meal: DietMeal;
	onUse: MealVariationSheetProps["onUse"];
}) {
	const [state, setState] = useState<State>({
		kind: "loading",
		previous: null,
	});
	const [using, setUsing] = useState(false);
	const avoid = useRef<string[]>([]);
	const started = useRef(false);

	async function suggest(previous: MealVariation | null) {
		setState({ kind: "loading", previous });
		const result = await suggestVariationAction({
			mealId: meal.id,
			avoid: avoid.current.slice(-10),
		});
		if (!result.ok) {
			setState({ kind: "error", error: result.error });
			return;
		}
		avoid.current.push(variationKey(meal.items, result.data.swaps));
		analytics.track("refeicao_variada_gerada", {
			outra: avoid.current.length > 1,
			trocas: result.data.swaps.length,
		});
		setState({ kind: "ready", variation: result.data });
	}

	// Pede a primeira ao abrir (o ref evita pedir duas vezes no StrictMode).
	useEffect(() => {
		if (started.current) return;
		started.current = true;
		void suggest(null);
	});

	const variation =
		state.kind === "ready"
			? state.variation
			: state.kind === "loading"
				? state.previous
				: null;
	const loading = state.kind === "loading";

	return (
		<>
			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{state.kind === "error" ? (
					<p role="alert" className="rounded-2xl bg-card p-4 text-sm">
						{state.error}
					</p>
				) : variation ? (
					<div
						className={loading ? "opacity-50 transition-opacity" : undefined}
					>
						<MealVariationView items={meal.items} variation={variation} />
					</div>
				) : (
					<output className="flex flex-col items-center gap-3 py-12 text-center">
						<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary motion-safe:animate-bounce">
							<Shuffle className="size-7" aria-hidden />
						</span>
						<span className="font-heading font-semibold">
							Montando outra versão…
						</span>
						<span className="text-muted-foreground text-sm">
							Com trocas que mantêm os macros.
						</span>
					</output>
				)}
			</div>
			<div className="grid grid-cols-1 gap-2 border-border border-t p-4 sm:grid-cols-2">
				{state.kind === "ready" && (
					<Button
						disabled={using}
						onClick={async () => {
							setUsing(true);
							await onUse(meal.id, state.variation);
							setUsing(false);
						}}
					>
						{using ? (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						) : (
							<Check data-icon="inline-start" />
						)}
						Usar esta
					</Button>
				)}
				<Button
					variant={state.kind === "ready" ? "outline" : "default"}
					className={state.kind === "ready" ? undefined : "sm:col-span-2"}
					disabled={loading || using}
					onClick={() => suggest(variation)}
				>
					{loading ? (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					) : (
						<Shuffle data-icon="inline-start" />
					)}
					{state.kind === "error" ? "Tentar de novo" : "Outra versão"}
				</Button>
			</div>
		</>
	);
}

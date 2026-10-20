"use client";

import { useEffect, useRef, useState } from "react";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { suggestMealFillAction } from "~/domains/meal-fill/actions/meal-fill-actions";
import { MealFillView } from "~/domains/meal-fill/components/meal-fill-view";
import type { MealFill } from "~/domains/meal-fill/schemas/meal-fill-schema";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Loader2Icon, Plus, Shuffle, Target } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { analytics } from "~/shared/lib/analytics/analytics";

interface MealFillSheetProps {
	meal: DietMeal | null;
	onOpenChange: (open: boolean) => void;
	/** "Adicionar à refeição": entra na dieta (com Desfazer); true fecha. */
	onAdd: (mealId: string, fill: MealFill) => Promise<boolean>;
}

// "Completar com IA (beta)" do menu da refeição: o que falta pra meta do
// dia vira alimentos nessa refeição. Nada muda até "Adicionar".
export function MealFillSheet({
	meal,
	onOpenChange,
	onAdd,
}: MealFillSheetProps) {
	return (
		<Sheet open={meal !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[85svh] sm:max-w-2xl sm:data-[side=bottom]:h-[80svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Completar com o que falta</SheetTitle>
					<SheetDescription>{meal?.name}</SheetDescription>
				</SheetHeader>
				{meal && <FillFlow key={meal.id} meal={meal} onAdd={onAdd} />}
			</BottomSheetContent>
		</Sheet>
	);
}

type State =
	| { kind: "loading"; previous: MealFill | null }
	| { kind: "ready"; fill: MealFill }
	| { kind: "error"; error: string };

const fillKey = (fill: MealFill) =>
	fill.items.map((item) => item.food.name).join(" + ");

function FillFlow({
	meal,
	onAdd,
}: {
	meal: DietMeal;
	onAdd: MealFillSheetProps["onAdd"];
}) {
	const [state, setState] = useState<State>({
		kind: "loading",
		previous: null,
	});
	const [adding, setAdding] = useState(false);
	const avoid = useRef<string[]>([]);
	const started = useRef(false);

	async function suggest(previous: MealFill | null) {
		setState({ kind: "loading", previous });
		const result = await suggestMealFillAction({
			mealId: meal.id,
			avoid: avoid.current.slice(-10),
		});
		if (!result.ok) {
			setState({ kind: "error", error: result.error });
			return;
		}
		avoid.current.push(fillKey(result.data));
		analytics.track("refeicao_completada_gerada", {
			outra: avoid.current.length > 1,
			alimentos: result.data.items.length,
		});
		setState({ kind: "ready", fill: result.data });
	}

	// Pede a primeira ao abrir (o ref evita pedir duas vezes no StrictMode).
	useEffect(() => {
		if (started.current) return;
		started.current = true;
		void suggest(null);
	});

	const fill =
		state.kind === "ready"
			? state.fill
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
				) : fill ? (
					<div
						className={loading ? "opacity-50 transition-opacity" : undefined}
					>
						<MealFillView fill={fill} />
					</div>
				) : (
					<output className="flex flex-col items-center gap-3 py-12 text-center">
						<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary motion-safe:animate-bounce">
							<Target className="size-7" aria-hidden />
						</span>
						<span className="font-heading font-semibold">
							Vendo o que falta…
						</span>
						<span className="text-muted-foreground text-sm">
							E o que combina com essa refeição.
						</span>
					</output>
				)}
			</div>
			<div className="grid grid-cols-1 gap-2 border-border border-t p-4 sm:grid-cols-2">
				{state.kind === "ready" && (
					<Button
						disabled={adding}
						onClick={async () => {
							setAdding(true);
							await onAdd(meal.id, state.fill);
							setAdding(false);
						}}
					>
						{adding ? (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						) : (
							<Plus data-icon="inline-start" />
						)}
						Adicionar à refeição
					</Button>
				)}
				<Button
					variant={state.kind === "ready" ? "outline" : "default"}
					className={state.kind === "ready" ? undefined : "sm:col-span-2"}
					disabled={loading || adding}
					onClick={() => suggest(fill)}
				>
					{loading ? (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					) : (
						<Shuffle data-icon="inline-start" />
					)}
					{state.kind === "error" ? "Tentar de novo" : "Outra sugestão"}
				</Button>
			</div>
		</>
	);
}

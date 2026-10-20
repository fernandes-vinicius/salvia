import type { DietItem } from "~/domains/diet/types/diet-types";
import { householdHint, MacroLine, UNIT_LABELS } from "~/domains/food";
import type { Food } from "~/domains/food/types/food-types";
import { applySwaps } from "~/domains/meal-recipe/utils/recipe-swap";
import type { MealVariation } from "~/domains/meal-variation/schemas/meal-variation-schema";
import { variationTotals } from "~/domains/meal-variation/utils/meal-variation";
import { ArrowRight } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";

interface MealVariationViewProps {
	/** Itens atuais da refeição (só os principais). */
	items: Pick<DietItem, "id" | "food" | "quantity">[];
	variation: MealVariation;
}

function Portion({ food, quantity }: { food: Food; quantity: number }) {
	const hint = householdHint(food, quantity);
	return (
		<span className="flex min-w-0 flex-col">
			<span className="text-pretty">{food.name}</span>
			<span className="text-muted-foreground text-xs tabular-nums">
				{formatNumber(quantity, 1)} {UNIT_LABELS[food.unit].short}
				{hint && ` · ${hint.short}`}
			</span>
		</span>
	);
}

// A versão sugerida: o que troca (antes → depois), o que fica e os macros
// da refeição atual × da nova, pra decidir antes de "Usar esta".
export function MealVariationView({
	items,
	variation,
}: MealVariationViewProps) {
	const swapped = applySwaps(items, variation.swaps);
	const kept = swapped.filter((item) => !item.replaces);
	const { before, after } = variationTotals(items, variation.swaps);

	return (
		<article className="flex flex-col gap-5">
			<header className="flex flex-col gap-1.5">
				<h3 className="text-balance font-heading font-semibold text-xl">
					{variation.title}
				</h3>
				<p className="text-pretty text-muted-foreground text-sm">
					{variation.summary}
				</p>
			</header>

			<section className="flex flex-col gap-2">
				<h4 className="font-heading font-semibold">Trocas</h4>
				<ul className="flex flex-col gap-2 text-sm">
					{swapped.map(
						(item) =>
							item.replaces && (
								<li
									key={item.food.id}
									className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl bg-secondary p-3"
								>
									<Portion {...item.replaces} />
									<ArrowRight
										className="size-4 text-muted-foreground"
										aria-label="trocado por"
									/>
									<Portion food={item.food} quantity={item.quantity} />
								</li>
							),
					)}
				</ul>
				{kept.length > 0 && (
					<p className="text-pretty text-muted-foreground text-xs">
						Continuam: {kept.map((item) => item.food.name).join(", ")}
					</p>
				)}
			</section>

			<div className="flex flex-col gap-2 rounded-2xl bg-muted px-4 py-3">
				<p className="text-muted-foreground text-xs">
					Quase os mesmos macros da refeição
				</p>
				<dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 text-sm">
					<dt className="text-muted-foreground">Agora</dt>
					<dd>
						<MacroLine macros={before} />
					</dd>
					<dt className="font-medium">Nova</dt>
					<dd>
						<MacroLine macros={after} />
					</dd>
				</dl>
			</div>
		</article>
	);
}

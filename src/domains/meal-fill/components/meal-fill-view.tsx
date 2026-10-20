import { householdHint, MacroLine, UNIT_LABELS } from "~/domains/food";
import type { Food } from "~/domains/food/types/food-types";
import { macrosFor } from "~/domains/food/utils/food";
import type { MealFill } from "~/domains/meal-fill/schemas/meal-fill-schema";
import { fillTotals } from "~/domains/meal-fill/utils/meal-fill";
import { formatNumber } from "~/shared/lib/format";

function Portion({ food, quantity }: { food: Food; quantity: number }) {
	const hint = householdHint(food, quantity);
	return (
		<span className="flex min-w-0 flex-col gap-0.5">
			<span className="text-pretty font-medium">{food.name}</span>
			<span className="text-muted-foreground text-xs tabular-nums">
				{formatNumber(quantity, 1)} {UNIT_LABELS[food.unit].short}
				{hint && ` · ${hint.short}`}
			</span>
			<MacroLine macros={macrosFor(food, quantity)} />
		</span>
	);
}

// A sugestão: o que entra (com as quantidades calculadas) e quanto do que
// faltava ela cobre.
export function MealFillView({ fill }: { fill: MealFill }) {
	const { macros, kcal } = fillTotals(fill.items);
	const lines = [
		{
			label: "Proteína",
			gap: fill.gap.protein,
			added: macros.proteinAnimal + macros.proteinVegetal,
		},
		{ label: "Carboidrato", gap: fill.gap.carbs, added: macros.carbs },
		{ label: "Gordura", gap: fill.gap.fat, added: macros.fat },
	];

	return (
		<article className="flex flex-col gap-5">
			<header className="flex flex-col gap-1.5">
				<h3 className="text-balance font-heading font-semibold text-xl">
					{fill.title}
				</h3>
				<p className="text-pretty text-muted-foreground text-sm">
					{fill.summary}
				</p>
			</header>

			<section className="flex flex-col gap-2">
				<h4 className="font-heading font-semibold">Entra na refeição</h4>
				<ul className="flex flex-col gap-2 text-sm">
					{fill.items.map((item) => (
						<li key={item.food.id} className="rounded-2xl bg-secondary p-3">
							<Portion food={item.food} quantity={item.quantity} />
						</li>
					))}
				</ul>
			</section>

			<div className="flex flex-col gap-2 rounded-2xl bg-muted px-4 py-3">
				<p className="text-muted-foreground text-xs">
					O que faltava no dia e quanto isso cobre (≈ {formatNumber(kcal)} kcal)
				</p>
				<dl className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1.5 text-sm tabular-nums">
					{lines.map((line) => (
						<div key={line.label} className="contents">
							<dt>{line.label}</dt>
							<dd className="text-right text-muted-foreground">
								falta {formatNumber(line.gap)} g
							</dd>
							<dd className="text-right font-medium">
								+{formatNumber(line.added)} g
							</dd>
						</div>
					))}
				</dl>
			</div>
		</article>
	);
}

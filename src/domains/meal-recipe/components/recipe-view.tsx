import type { ReactNode } from "react";

import { householdHint, kcalFor, MacroLine, UNIT_LABELS } from "~/domains/food";
import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import type { RecipeSnapshot } from "~/domains/meal-recipe/utils/saved-recipe";
import { Clock, Lightbulb } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";

interface RecipeViewProps {
	recipe: MealRecipe;
	/**
	 * Ingredientes e macros: da refeição atual (`recipeSnapshot`) ou da foto
	 * guardada na receita salva. Nunca do texto da IA.
	 */
	snapshot: RecipeSnapshot;
	/** Aviso acima dos ingredientes (ex.: "sua refeição mudou"). */
	notice?: ReactNode;
}

// A receita, fácil de ler no celular: o que é, os mesmos macros da refeição,
// ingredientes (da dieta), extras sem caloria e o passo a passo.
export function RecipeView({ recipe, snapshot, notice }: RecipeViewProps) {
	const { ingredients, macros } = snapshot;

	return (
		<article className="flex flex-col gap-5">
			<header className="flex flex-col gap-1.5">
				<h3 className="text-balance font-heading font-semibold text-xl">
					{recipe.title}
				</h3>
				<p className="text-pretty text-muted-foreground text-sm">
					{recipe.summary}
				</p>
				<p className="flex items-center gap-1.5 text-sm tabular-nums">
					<Clock className="size-4 text-muted-foreground" aria-hidden />
					{formatNumber(recipe.minutes)} min
				</p>
			</header>

			<div className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3">
				<p className="text-muted-foreground text-xs">
					Mesmos macros da refeição
				</p>
				<p className="font-heading font-semibold tabular-nums">
					{formatNumber(kcalFor(macros))} kcal
				</p>
				<MacroLine macros={macros} />
			</div>

			{notice}

			<section className="flex flex-col gap-2">
				<h4 className="font-heading font-semibold">Ingredientes</h4>
				<ul className="flex flex-col gap-1.5 text-sm">
					{ingredients.map((ingredient) => {
						const { name, unit, quantity } = ingredient;
						const hint = householdHint({ name, unit }, quantity);
						return (
							<li
								key={`${ingredient.foodId}-${quantity}`}
								className="flex justify-between gap-3"
							>
								<span className="min-w-0">{name}</span>
								<span className="shrink-0 text-right tabular-nums">
									{formatNumber(quantity, 1)} {UNIT_LABELS[unit].short}
									{hint && (
										<span className="block text-muted-foreground text-xs">
											{hint.short}
										</span>
									)}
								</span>
							</li>
						);
					})}
				</ul>
				{recipe.extras.length > 0 && (
					<div className="flex flex-col gap-1.5 pt-1">
						<p className="text-muted-foreground text-xs">
							Pode juntar (não muda os macros)
						</p>
						<ul className="flex flex-col gap-1.5 text-sm">
							{recipe.extras.map((extra) => (
								<li key={extra.name} className="flex justify-between gap-3">
									<span className="min-w-0">{extra.name}</span>
									<span className="shrink-0 text-muted-foreground">
										{extra.amount}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</section>

			<section className="flex flex-col gap-2">
				<h4 className="font-heading font-semibold">Modo de preparo</h4>
				<ol className="flex flex-col gap-3 text-sm">
					{recipe.steps.map((step, index) => (
						<li key={step} className="flex gap-3">
							<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-heading font-semibold text-secondary-foreground text-xs tabular-nums">
								{index + 1}
							</span>
							<span className="min-w-0 text-pretty pt-0.5">{step}</span>
						</li>
					))}
				</ol>
			</section>

			{recipe.tip && (
				<p className="flex gap-2 rounded-2xl bg-secondary p-3 text-sm">
					<Lightbulb
						className="mt-0.5 size-4 shrink-0 text-primary"
						aria-hidden
					/>
					<span className="text-pretty">{recipe.tip}</span>
				</p>
			)}
		</article>
	);
}

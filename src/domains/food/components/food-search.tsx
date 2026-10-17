"use client";

import { useEffect, useState } from "react";

import { searchFoodsAction } from "~/domains/food/actions/food-actions";
import { MacroLine } from "~/domains/food/components/macro-line";
import type { Food } from "~/domains/food/types/food-types";
import { macrosFor, UNIT_LABELS } from "~/domains/food/utils/food";
import { Loader2Icon, PackagePlus, Search } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { useDebouncedValue } from "~/shared/hooks/use-debounced-value";

interface FoodSearchProps {
	onSelect: (food: Food) => void;
	onCreate: (name: string) => void;
}

const MIN_QUERY = 2;

export function FoodSearch({ onSelect, onCreate }: FoodSearchProps) {
	const [query, setQuery] = useState("");
	const debounced = useDebouncedValue(query.trim(), 250);
	const [results, setResults] = useState<Food[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (debounced.length < MIN_QUERY) {
			setResults([]);
			return;
		}
		let cancelled = false;
		setLoading(true);
		searchFoodsAction(debounced)
			.then((foods) => {
				if (!cancelled) setResults(foods);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [debounced]);

	const showEmpty =
		debounced.length >= MIN_QUERY && !loading && results.length === 0;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					autoFocus
					type="search"
					placeholder="Buscar alimento (ex.: frango, arroz)"
					aria-label="Buscar alimento"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					className="pl-9"
				/>
				{loading && (
					<Loader2Icon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
				)}
			</div>

			{debounced.length < MIN_QUERY && (
				<p className="px-1 text-muted-foreground text-sm">
					Digite pelo menos 2 letras. A busca inclui a Tabela TACO e os
					alimentos que você cadastrar.
				</p>
			)}
			{showEmpty && (
				<p className="px-1 text-muted-foreground text-sm">
					Nada encontrado para “{debounced}”.
				</p>
			)}
			<ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
				{results.map((food) => (
					<li key={food.id}>
						<button
							type="button"
							onClick={() => onSelect(food)}
							className="flex w-full flex-col gap-0.5 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							<span className="flex items-center gap-2">
								<span className="font-medium text-sm">{food.name}</span>
								{food.source === "custom" && (
									<Badge variant="secondary">Meu</Badge>
								)}
							</span>
							<span className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground text-xs">
								<span>Em {UNIT_LABELS[food.unit].base}:</span>
								<MacroLine
									macros={macrosFor(food, food.unit === "unit" ? 1 : 100)}
								/>
							</span>
						</button>
					</li>
				))}
			</ul>

			<Button
				type="button"
				variant="secondary"
				onClick={() => onCreate(query.trim())}
			>
				<PackagePlus data-icon="inline-start" />
				Não achou? Cadastrar alimento
			</Button>
		</div>
	);
}

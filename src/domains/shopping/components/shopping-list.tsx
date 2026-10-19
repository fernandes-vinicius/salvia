"use client";

import { parseAsNumberLiteral, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	resetUserPriceAction,
	setUserPriceAction,
} from "~/domains/shopping/actions/price-actions";
import { PriceSheet } from "~/domains/shopping/components/price-sheet";
import { ShoppingGroups } from "~/domains/shopping/components/shopping-groups";
import {
	type Price,
	REFERENCE_PRICES_UPDATED_AT,
} from "~/domains/shopping/data/reference-prices";
import {
	formatMoney,
	priceKey,
	shoppingCost,
} from "~/domains/shopping/utils/prices";
import {
	buildShoppingList,
	type ShoppingItem,
	shoppingListText,
} from "~/domains/shopping/utils/shopping-list";
import { Printer, Share } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "~/shared/components/ui/toggle-group";
import { usePrintSetup } from "~/shared/hooks/use-print-setup";

const PERIODS = [
	{ days: 1, label: "1 dia" },
	{ days: 3, label: "3 dias" },
	{ days: 7, label: "1 semana" },
	{ days: 14, label: "2 semanas" },
	{ days: 30, label: "1 mês" },
] as const;

const PERIOD_DAYS = PERIODS.map((period) => period.days);
type PeriodDays = (typeof PERIOD_DAYS)[number];

/** Itens já pegos no mercado, por período (só neste aparelho). */
const CHECKED_KEY = (days: number) => `salvia:compras:${days}`;

function readChecked(days: number): Set<string> {
	try {
		return new Set(
			JSON.parse(localStorage.getItem(CHECKED_KEY(days)) ?? "[]") as string[],
		);
	} catch {
		return new Set();
	}
}

function writeChecked(days: number, checked: Set<string>) {
	try {
		localStorage.setItem(CHECKED_KEY(days), JSON.stringify([...checked]));
	} catch {
		// Sem armazenamento: as marcações valem só até recarregar.
	}
}

interface ShoppingListProps {
	meals: DietMeal[];
	/** Preços que a pessoa salvou (`[chave, preço]`). */
	initialPrices: [string, Price][];
}

// Lista de compras a partir da dieta: escolhe o período, marca o que já
// pegou, vê o custo (preço de referência ou o seu), compartilha ou imprime.
export function ShoppingList({ meals, initialPrices }: ShoppingListProps) {
	const [days, setDays] = useQueryState(
		"dias",
		parseAsNumberLiteral(PERIOD_DAYS)
			.withDefault(7)
			.withOptions({ history: "replace" }),
	);
	const [checked, setChecked] = useState<Set<string>>(new Set());
	useEffect(() => setChecked(readChecked(days)), [days]);
	usePrintSetup("Lista de compras");
	const [prices, setPrices] = useState(() => new Map(initialPrices));
	const [editing, setEditing] = useState<ShoppingItem | null>(null);

	const groups = buildShoppingList(meals, days);
	const total = groups.reduce((sum, group) => sum + group.items.length, 0);
	const cost = shoppingCost(groups, prices);
	const perDay = cost.total / days;

	async function savePrice(item: ShoppingItem, price: Price | null) {
		const key = priceKey(item.name);
		const previous = prices;
		const next = new Map(prices);
		if (price) next.set(key, price);
		else next.delete(key);
		setPrices(next);
		const result = price
			? await setUserPriceAction({ name: item.name, ...price })
			: await resetUserPriceAction(item.name);
		if (!result.ok) {
			setPrices(previous);
			toast.error(result.error);
			return false;
		}
		setEditing(null);
		toast.success(
			price ? `Preço de ${item.name} salvo.` : "Voltou ao preço de referência.",
		);
		return true;
	}

	function toggle(key: string, value: boolean) {
		const next = new Set(checked);
		if (value) next.add(key);
		else next.delete(key);
		setChecked(next);
		writeChecked(days, next);
	}

	function clearChecked() {
		setChecked(new Set());
		writeChecked(days, new Set());
	}

	async function share() {
		const text = shoppingListText(groups, days, cost.total);
		try {
			if (navigator.share) {
				await navigator.share({ title: "Lista de compras", text });
				return;
			}
			await navigator.clipboard.writeText(text);
			toast.success("Lista copiada. É só colar no WhatsApp ou nas notas.");
		} catch (error) {
			// Cancelar o compartilhamento não é erro.
			if (error instanceof DOMException && error.name === "AbortError") return;
			toast.error("Não foi possível compartilhar. Tente imprimir.");
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
				<ToggleGroup
					aria-label="Período da lista"
					variant="outline"
					value={[String(days)]}
					onValueChange={(values: string[]) => {
						const next = Number(values[0]);
						if (PERIOD_DAYS.includes(next as PeriodDays)) {
							void setDays(next as PeriodDays);
						}
					}}
					className="flex-wrap"
				>
					{PERIODS.map((period) => (
						<ToggleGroupItem
							key={period.days}
							value={String(period.days)}
							className="aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground hover:aria-pressed:bg-primary/90 hover:aria-pressed:text-primary-foreground"
						>
							{period.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<div className="flex gap-2">
					<Button variant="secondary" onClick={share}>
						<Share data-icon="inline-start" />
						Compartilhar
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Imprimir ou salvar em PDF"
						onClick={() => window.print()}
					>
						<Printer />
					</Button>
				</div>
			</div>

			<header className="hidden print:block">
				<h1 className="font-heading font-semibold text-2xl">
					Lista de compras ·{" "}
					{PERIODS.find((period) => period.days === days)?.label}
				</h1>
			</header>

			{cost.total > 0 && (
				<section
					aria-labelledby="diet-cost"
					className="flex flex-col gap-1 rounded-3xl bg-secondary p-4 text-secondary-foreground md:p-5 print:border print:border-border print:bg-transparent"
				>
					<h2 id="diet-cost" className="font-medium text-sm">
						Custo estimado ·{" "}
						{PERIODS.find((period) => period.days === days)?.label}
					</h2>
					<p className="font-heading font-semibold text-3xl tabular-nums">
						≈ {formatMoney(cost.total)}
					</p>
					<p className="text-sm tabular-nums">
						{formatMoney(perDay)} por dia · {formatMoney(perDay * 30)} por mês
					</p>
					<p className="mt-1 text-pretty text-xs">
						{cost.missing > 0 &&
							`${cost.missing} ${cost.missing === 1 ? "item ainda sem preço" : "itens ainda sem preço"}: toque em "Definir preço". `}
						Preços de referência são médias aproximadas de{" "}
						{REFERENCE_PRICES_UPDATED_AT}; toque num preço pra usar o do seu
						mercado.
					</p>
				</section>
			)}

			<ShoppingGroups
				groups={groups}
				checked={checked}
				onToggle={toggle}
				prices={cost.byItem}
				onEditPrice={setEditing}
			/>

			<PriceSheet
				item={editing}
				current={editing ? (cost.byItem.get(editing.key) ?? null) : null}
				onOpenChange={(open) => !open && setEditing(null)}
				onSave={savePrice}
			/>

			<div className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
				<p className="text-pretty">
					Quantidades estimadas pela sua dieta e arredondadas pra cima. Arroz,
					feijão e carnes aparecem no peso cru, que é como se compra.
				</p>
				{checked.size > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="self-start print:hidden"
						onClick={clearChecked}
					>
						Desmarcar tudo ({checked.size} de {total})
					</Button>
				)}
			</div>
		</div>
	);
}

"use client";

import { parseAsNumberLiteral, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { ShoppingGroups } from "~/domains/shopping/components/shopping-groups";
import {
	buildShoppingList,
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

// Lista de compras a partir da dieta: escolhe o período, marca o que já
// pegou, compartilha (WhatsApp) ou imprime.
export function ShoppingList({ meals }: { meals: DietMeal[] }) {
	const [days, setDays] = useQueryState(
		"dias",
		parseAsNumberLiteral(PERIOD_DAYS)
			.withDefault(7)
			.withOptions({ history: "replace" }),
	);
	const [checked, setChecked] = useState<Set<string>>(new Set());
	useEffect(() => setChecked(readChecked(days)), [days]);
	usePrintSetup("Lista de compras");

	const groups = buildShoppingList(meals, days);
	const total = groups.reduce((sum, group) => sum + group.items.length, 0);

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
		const text = shoppingListText(groups, days);
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

			<ShoppingGroups groups={groups} checked={checked} onToggle={toggle} />

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

"use client";

import { useState } from "react";

import type {
	Price,
	PriceUnit,
} from "~/domains/shopping/data/reference-prices";
import { REFERENCE_PRICES_UPDATED_AT } from "~/domains/shopping/data/reference-prices";
import {
	formatPrice,
	type ItemPrice,
	PRICE_UNIT_LABELS,
	priceUnitsFor,
	referencePrice,
} from "~/domains/shopping/utils/prices";
import type { ShoppingItem } from "~/domains/shopping/utils/shopping-list";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface PriceSheetProps {
	item: ShoppingItem | null;
	current: ItemPrice | null;
	onOpenChange: (open: boolean) => void;
	/** `price` nulo = voltar ao de referência. Devolve se deu certo. */
	onSave: (item: ShoppingItem, price: Price | null) => Promise<boolean>;
}

// "Quanto você paga?": o preço do mercado da pessoa vence o de referência
// nas contas da lista de compras.
export function PriceSheet({
	item,
	current,
	onOpenChange,
	onSave,
}: PriceSheetProps) {
	return (
		<Sheet open={item !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>Preço de {item?.name}</SheetTitle>
					<SheetDescription>
						Coloque quanto você paga no seu mercado. Vale só pra você e entra no
						custo da dieta.
					</SheetDescription>
				</SheetHeader>
				{item && (
					<PriceForm
						key={item.key}
						item={item}
						current={current}
						onSave={onSave}
					/>
				)}
			</BottomSheetContent>
		</Sheet>
	);
}

function PriceForm({
	item,
	current,
	onSave,
}: {
	item: ShoppingItem;
	current: ItemPrice | null;
	onSave: PriceSheetProps["onSave"];
}) {
	const units = priceUnitsFor(item.quantity);
	const reference = referencePrice(item.name);
	const initialUnit =
		current && units.includes(current.price.per) ? current.price.per : units[0];
	const [per, setPer] = useState<PriceUnit>(initialUnit);
	const [value, setValue] = useState(
		current?.source === "user" ? String(current.price.value) : "",
	);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState<"save" | "reset" | null>(null);

	async function save(event: React.FormEvent) {
		event.preventDefault();
		const number = Number(value.replace(",", "."));
		if (!Number.isFinite(number) || number <= 0) {
			setError("Digite um preço maior que zero.");
			return;
		}
		setPending("save");
		const ok = await onSave(item, { value: number, per });
		if (!ok) setPending(null);
	}

	async function reset() {
		setPending("reset");
		const ok = await onSave(item, null);
		if (!ok) setPending(null);
	}

	return (
		<form onSubmit={save} className="flex flex-col gap-5 p-4">
			{units.length > 1 && (
				<fieldset className="flex flex-col gap-2">
					<legend className="mb-2 font-medium text-sm">Preço por</legend>
					<div className="flex flex-wrap gap-2">
						{units.map((unit) => (
							<Button
								key={unit}
								type="button"
								size="sm"
								variant={unit === per ? "default" : "outline"}
								aria-pressed={unit === per}
								onClick={() => setPer(unit)}
							>
								{PRICE_UNIT_LABELS[unit]}
							</Button>
						))}
					</div>
				</fieldset>
			)}

			<Field>
				<FieldLabel htmlFor="price-value">
					Preço (R$ por {PRICE_UNIT_LABELS[per]})
				</FieldLabel>
				<Input
					id="price-value"
					type="number"
					inputMode="decimal"
					step="0.01"
					min="0"
					placeholder={
						reference && reference.per === per
							? String(reference.value)
							: "0,00"
					}
					value={value}
					aria-invalid={error !== null}
					onChange={(event) => {
						setValue(event.target.value);
						if (error) setError(null);
					}}
				/>
				<FieldError errors={error ? [{ message: error }] : undefined} />
				{reference && (
					<p className="text-muted-foreground text-xs">
						Referência: ≈ {formatPrice(reference)}, média aproximada de{" "}
						{REFERENCE_PRICES_UPDATED_AT}.
					</p>
				)}
			</Field>

			<div className="flex flex-col gap-2">
				<Button type="submit" disabled={pending !== null}>
					{pending === "save" && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					Salvar meu preço
				</Button>
				{current?.source === "user" && (
					<Button
						type="button"
						variant="ghost"
						disabled={pending !== null}
						onClick={reset}
					>
						{pending === "reset" && (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						)}
						{reference ? "Voltar ao preço de referência" : "Apagar meu preço"}
					</Button>
				)}
			</div>
		</form>
	);
}

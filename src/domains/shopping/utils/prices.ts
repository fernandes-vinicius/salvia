import { normalizeSearchText } from "~/domains/food/utils/food";
import {
	PRICE_KEYWORDS,
	type Price,
	type PriceUnit,
	REFERENCE_PRICES,
} from "~/domains/shopping/data/reference-prices";
import type {
	ShoppingGroup,
	ShoppingItem,
} from "~/domains/shopping/utils/shopping-list";
import { formatNumber } from "~/shared/lib/format";

/** Chave do preço: nome do item sem acento e minúsculo. */
export const priceKey = (name: string) => normalizeSearchText(name);

const REFERENCE_BY_KEY = new Map(
	Object.entries(REFERENCE_PRICES).map(([name, price]) => [
		priceKey(name),
		price,
	]),
);

export function referencePrice(name: string): Price | null {
	const key = priceKey(name);
	return (
		REFERENCE_BY_KEY.get(key) ??
		PRICE_KEYWORDS.find(([keyword]) => key.includes(keyword))?.[1] ??
		null
	);
}

/** Unidades de preço que fazem sentido pro item (a primeira é a padrão). */
export function priceUnitsFor(quantity: ShoppingItem["quantity"]): PriceUnit[] {
	if (quantity.unit === "unit") return ["un", "dz"];
	if (quantity.unit === "ml") return ["L"];
	return quantity.count !== null ? ["kg", "un", "dz"] : ["kg"];
}

/**
 * Custo da quantidade exata do item (não da arredondada pra comprar). Null
 * quando o preço não combina com o item (ex.: por unidade num item em kg).
 */
export function itemCost(
	quantity: ShoppingItem["quantity"],
	price: Price,
): number | null {
	const { unit, value, count } = quantity;
	switch (price.per) {
		case "kg":
		case "L":
			// g ≈ ml: diferença pequena pra óleo e leite numa estimativa.
			return unit === "unit" ? null : (value / 1000) * price.value;
		case "un":
			return count === null ? null : count * price.value;
		case "dz":
			return count === null ? null : (count / 12) * price.value;
	}
}

export type PriceSource = "user" | "reference";

export interface ItemPrice {
	price: Price;
	source: PriceSource;
	/** Null quando o preço não combina com o item. */
	cost: number | null;
}

/** Preço do usuário (se tiver) ou o de referência. */
export function resolveItemPrice(
	item: ShoppingItem,
	userPrices: ReadonlyMap<string, Price>,
): ItemPrice | null {
	const user = userPrices.get(priceKey(item.name));
	const price = user ?? referencePrice(item.name);
	if (!price) return null;
	return {
		price,
		source: user ? "user" : "reference",
		cost: itemCost(item.quantity, price),
	};
}

export interface ShoppingCost {
	/** Soma dos itens com preço (R$). */
	total: number;
	byItem: Map<string, ItemPrice | null>;
	/** Itens sem preço (ou com preço que não combina). */
	missing: number;
}

export function shoppingCost(
	groups: ShoppingGroup[],
	userPrices: ReadonlyMap<string, Price>,
): ShoppingCost {
	const byItem = new Map<string, ItemPrice | null>();
	let total = 0;
	let missing = 0;
	for (const item of groups.flatMap((group) => group.items)) {
		const resolved = resolveItemPrice(item, userPrices);
		byItem.set(item.key, resolved);
		if (resolved?.cost == null) missing++;
		else total += resolved.cost;
	}
	return { total, byItem, missing };
}

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
	kg: "kg",
	L: "litro",
	un: "unidade",
	dz: "dúzia",
};

/** "R$ 22,00" */
export const formatMoney = (value: number) =>
	value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 22/kg", "R$ 10/dz" */
export const formatPrice = (price: Price) =>
	`R$ ${formatNumber(price.value, 2, 2)}/${price.per}`;

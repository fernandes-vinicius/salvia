import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { FoodUnit } from "~/domains/food/types/food-types";
import {
	CATEGORY_SECTIONS,
	PURCHASE_RULES,
	type PurchaseRule,
	SECTION_ORDER,
	type ShoppingSection,
} from "~/domains/shopping/data/purchase-rules";
import { formatNumber } from "~/shared/lib/format";

export interface ShoppingItem {
	key: string;
	name: string;
	/** Quanto comprar, já arredondado pra cima ("1,2 kg", "14 ovos"). */
	amount: string;
	/** Explicação curta (cru × pronto, dúzias, peso aproximado). */
	detail: string | null;
	/** Quantidade exata (sem arredondar) pra calcular o custo. */
	quantity: {
		/** Medido em: g/ml (crus) ou unidades (alimento por unidade). */
		unit: FoodUnit;
		value: number;
		/** Unidades de mercado (ovos, bananas, pães), quando a regra define. */
		count: number | null;
	};
}

export interface ShoppingGroup {
	section: ShoppingSection;
	items: ShoppingItem[];
}

interface Accumulator {
	name: string;
	section: ShoppingSection;
	unit: FoodUnit;
	rule: PurchaseRule | null;
	/** Quantidade a comprar (g/ml crus, ou unidades se `unit` = unit). */
	total: number;
	/** Peso pronto dos itens convertidos de cozido (arroz cozido → cru). */
	convertedReady: number;
	/** Algum alimento entrou já cru (não dá pra dizer quanto rende). */
	hasRaw: boolean;
}

/** Arredonda pra cima em passos amigáveis de mercado. */
export function formatAmount(value: number, unit: "g" | "ml") {
	const big = unit === "g" ? "kg" : "L";
	if (value >= 1000) {
		return `${formatNumber(Math.ceil(value / 100) / 10, 1)} ${big}`;
	}
	const step = value < 100 ? 10 : 50;
	return `${formatNumber(Math.ceil(value / step) * step)} ${unit}`;
}

function describeDozens(count: number) {
	const dozens = Math.round((count / 12) * 2) / 2;
	if (dozens < 1) return null;
	return `≈ ${formatNumber(dozens, 1)} ${dozens === 1 ? "dúzia" : "dúzias"}`;
}

function toItem(key: string, acc: Accumulator): ShoppingItem {
	const quantity = {
		unit: acc.unit,
		value: acc.total,
		count:
			acc.unit === "unit"
				? acc.total
				: acc.rule?.unit && acc.unit === "g"
					? acc.total / acc.rule.unit.grams
					: null,
	};
	if (acc.unit === "unit") {
		return {
			key,
			name: acc.name,
			amount: `${formatNumber(Math.ceil(acc.total))} un.`,
			detail: null,
			quantity,
		};
	}

	const unit = acc.rule?.unit;
	if (unit && acc.unit === "g") {
		const count = Math.ceil(acc.total / unit.grams);
		const details = [
			unit.dozen ? describeDozens(count) : null,
			`≈ ${formatAmount(acc.total, "g")}`,
		].filter(Boolean);
		return {
			key,
			name: acc.name,
			amount: `${formatNumber(count)} ${count === 1 ? unit.singular : unit.plural}`,
			detail: details.join(" · "),
			quantity,
		};
	}

	const converted = acc.convertedReady > 0;
	return {
		key,
		name: acc.name,
		amount: formatAmount(acc.total, acc.unit),
		detail:
			converted && !acc.hasRaw
				? `peso cru · rende ≈ ${formatAmount(acc.convertedReady, "g")} pronto`
				: converted || acc.rule?.rawPerGram !== undefined
					? "peso cru"
					: null,
		quantity,
	};
}

/**
 * Lista de compras pra `days` dias seguindo a dieta: soma cada alimento,
 * converte o que está pronto na dieta (arroz cozido, frango grelhado) pro que
 * se compra (cru), junta itens iguais e agrupa por seção do mercado.
 */
export function buildShoppingList(
	meals: DietMeal[],
	days: number,
): ShoppingGroup[] {
	const items = new Map<string, Accumulator>();

	for (const meal of meals) {
		for (const { food, quantity } of meal.items) {
			const ready = quantity * days;
			if (ready <= 0) continue;

			const rule =
				food.source === "taco" ? (PURCHASE_RULES[food.name] ?? null) : null;
			const key = rule ? `rule:${rule.name}` : `food:${food.id}`;
			const section =
				rule?.section ??
				(food.category ? CATEGORY_SECTIONS[food.category] : undefined) ??
				"Outros";

			const acc = items.get(key) ?? {
				name: rule?.name ?? food.name,
				section,
				unit: food.unit,
				rule,
				total: 0,
				convertedReady: 0,
				hasRaw: false,
			};
			const rawPerGram = rule?.rawPerGram ?? 1;
			acc.total += ready * rawPerGram;
			if (rawPerGram !== 1) acc.convertedReady += ready;
			else if (rule?.rawPerGram === 1) acc.hasRaw = true;
			items.set(key, acc);
		}
	}

	return SECTION_ORDER.flatMap((section) => {
		const sectionItems = [...items.entries()]
			.filter(([, acc]) => acc.section === section)
			.map(([key, acc]) => toItem(key, acc))
			.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
		return sectionItems.length > 0 ? [{ section, items: sectionItems }] : [];
	});
}

/** Texto pra colar no WhatsApp/notas (negrito com *). */
export function shoppingListText(
	groups: ShoppingGroup[],
	days: number,
	/** Custo estimado (R$), quando há preços. */
	cost?: number,
) {
	const header = `*Lista de compras · ${days} ${days === 1 ? "dia" : "dias"}*`;
	const body = groups.map(
		(group) =>
			`*${group.section}*\n${group.items
				.map((item) => `- ${item.name}: ${item.amount}`)
				.join("\n")}`,
	);
	const footer =
		cost && cost > 0
			? [
					`*Custo estimado:* ≈ ${cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
				]
			: [];
	return [header, ...body, ...footer].join("\n\n");
}

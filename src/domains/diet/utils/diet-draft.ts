import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { formatNumber } from "~/shared/lib/format";

export type DraftItemChange =
	| { kind: "changed"; before: number }
	| { kind: "new" };

export interface DraftDiff {
	/** Itens do rascunho que mudaram ou são novos (os iguais ficam de fora). */
	items: Record<string, DraftItemChange>;
	/** Alimentos da dieta atual que o rascunho tirou, por refeição do rascunho. */
	removed: Record<string, DietItem[]>;
	/** O que muda, por refeição, pra confirmar antes de usar o rascunho. */
	groups: { meal: string; lines: string[] }[];
	/** Quantas mudanças (linhas) ao todo. */
	count: number;
}

const amount = (item: Pick<DietItem, "quantity" | "food">) =>
	`${formatNumber(item.quantity, 1)} ${UNIT_LABELS[item.food.unit].short}`;

const sameQuantity = (a: number, b: number) => Math.abs(a - b) < 0.001;

/**
 * Compara o rascunho com a dieta atual. As refeições casam pela origem
 * (`sourceMealId`); os alimentos, dentro da refeição, pelo alimento (primeiro
 * a mesma quantidade, depois o primeiro que sobrar). Trocar um alimento por
 * outro aparece como um tirado e um novo.
 */
export function diffDraft(base: DietMeal[], draft: DietMeal[]): DraftDiff {
	const items: DraftDiff["items"] = {};
	const removed: DraftDiff["removed"] = {};
	const groups: DraftDiff["groups"] = [];
	const used = new Set<string>();

	for (const meal of draft) {
		const source = base.find(
			(entry) => entry.id === meal.sourceMealId && !used.has(entry.id),
		);
		const lines: string[] = [];

		if (!source) {
			lines.push("Refeição nova");
			for (const entry of meal.items) {
				items[entry.id] = { kind: "new" };
				lines.push(`+ ${entry.food.name} ${amount(entry)}`);
			}
			groups.push({ meal: meal.name, lines });
			continue;
		}

		used.add(source.id);
		if (source.name !== meal.name) {
			lines.push(`Nome: ${source.name} → ${meal.name}`);
		}
		if (source.time !== meal.time) {
			lines.push(`Horário: ${source.time ?? "sem"} → ${meal.time ?? "sem"}`);
		}

		const left = [...source.items];
		const matches = new Map<string, DietItem>();
		// Primeiro a mesma quantidade, pra um alimento repetido casar certo.
		for (const entry of meal.items) {
			const index = left.findIndex(
				(old) =>
					old.food.id === entry.food.id &&
					sameQuantity(old.quantity, entry.quantity),
			);
			if (index >= 0) matches.set(entry.id, left.splice(index, 1)[0]);
		}
		for (const entry of meal.items) {
			if (matches.has(entry.id)) continue;
			const index = left.findIndex((old) => old.food.id === entry.food.id);
			if (index >= 0) matches.set(entry.id, left.splice(index, 1)[0]);
		}

		for (const entry of meal.items) {
			const old = matches.get(entry.id);
			if (!old) {
				items[entry.id] = { kind: "new" };
				lines.push(`+ ${entry.food.name} ${amount(entry)}`);
			} else if (!sameQuantity(old.quantity, entry.quantity)) {
				items[entry.id] = { kind: "changed", before: old.quantity };
				lines.push(`${entry.food.name}: ${amount(old)} → ${amount(entry)}`);
			}
		}
		if (left.length > 0) {
			removed[meal.id] = left;
			for (const old of left) lines.push(`− ${old.food.name} ${amount(old)}`);
		}
		if (lines.length > 0) groups.push({ meal: meal.name, lines });
	}

	for (const meal of base) {
		if (!used.has(meal.id)) {
			groups.push({ meal: meal.name, lines: ["Refeição tirada"] });
		}
	}

	return {
		items,
		removed,
		groups,
		count: groups.reduce((total, group) => total + group.lines.length, 0),
	};
}

export interface ApplyPlan {
	/** A refeição do rascunho (`from`) vira a da dieta (`into`), mantendo o id. */
	update: { from: string; into: string; position: number }[];
	/** Refeição nova no rascunho: passa a valer como está. */
	promote: { id: string; position: number }[];
	/** Refeições da dieta que o rascunho tirou. */
	remove: string[];
}

/**
 * Como usar uma versão (rascunho ou a anterior) sem recriar as refeições que
 * continuam: elas são atualizadas no lugar, e o check-in, os suplementos e as
 * receitas ligados a elas seguem valendo.
 */
export function applyPlan(
	activeIds: string[],
	meals: Pick<DietMeal, "id" | "sourceMealId">[],
): ApplyPlan {
	const plan: ApplyPlan = { update: [], promote: [], remove: [] };
	const used = new Set<string>();
	for (const [position, meal] of meals.entries()) {
		const source = meal.sourceMealId;
		if (source && activeIds.includes(source) && !used.has(source)) {
			used.add(source);
			plan.update.push({ from: meal.id, into: source, position });
		} else {
			plan.promote.push({ id: meal.id, position });
		}
	}
	plan.remove = activeIds.filter((id) => !used.has(id));
	return plan;
}

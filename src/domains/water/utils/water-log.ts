import {
	addDays,
	STREAK_MILESTONES,
	weekdayOf,
} from "~/domains/checkin/utils/checkin";
import type { WaterDay } from "~/domains/water/types/water-types";
import { formatNumber } from "~/shared/lib/format";

/** Atalhos de um toque (ml): copo, garrafa, garrafa grande, galão de 2 L. */
export const WATER_QUICK_ADDS = [250, 500, 1000, 2000] as const;

/** Teto do total do dia (ml), contra toque repetido sem querer. */
export const MAX_DAY_ML = 15_000;
/** Maior quantidade digitada de uma vez (ml). */
export const MAX_ENTRY_ML = 5000;

const logOf = (logs: WaterDay[], day: string) =>
	logs.find((log) => log.day === day);

/** Bateu o recomendado do dia (o que estava valendo naquele dia). */
export function isWaterGoalMet(logs: WaterDay[], day: string) {
	const log = logOf(logs, day);
	return !!log && log.targetMl > 0 && log.ml >= log.targetMl;
}

/**
 * Dias seguidos batendo a meta. Hoje só entra quando já bateu; enquanto não,
 * a sequência vale até ontem (não "quebra" de manhã).
 */
export function waterStreak(logs: WaterDay[], today: string) {
	let day = isWaterGoalMet(logs, today) ? today : addDays(today, -1);
	let streak = 0;
	while (isWaterGoalMet(logs, day)) {
		streak++;
		day = addDays(day, -1);
	}
	return streak;
}

export type WaterDayState = "full" | "partial" | "none";

/** Últimos 7 dias (o último é hoje) e em quantos bateu a meta. */
export function waterWeek(logs: WaterDay[], today: string) {
	const days = [];
	let metDays = 0;
	for (let offset = -6; offset <= 0; offset++) {
		const day = addDays(today, offset);
		const met = isWaterGoalMet(logs, day);
		if (met) metDays++;
		const state: WaterDayState = met
			? "full"
			: (logOf(logs, day)?.ml ?? 0) > 0
				? "partial"
				: "none";
		days.push({ day, ...weekdayOf(day), state, isToday: offset === 0 });
	}
	return { days, metDays };
}

/**
 * Comemoração ao registrar água: só quando hoje passa a bater a meta
 * (`milestone` se a sequência chegou num marco). Beber mais depois, ou tirar
 * água, não comemora.
 */
export function waterCelebrationFor({
	before,
	after,
	today,
}: {
	before: WaterDay[];
	after: WaterDay[];
	today: string;
}): "day" | "milestone" | null {
	if (isWaterGoalMet(before, today) || !isWaterGoalMet(after, today)) {
		return null;
	}
	const streak = waterStreak(after, today);
	return (STREAK_MILESTONES as readonly number[]).includes(streak)
		? "milestone"
		: "day";
}

/** Soma `ml` (negativo tira) ao total, entre 0 e `MAX_DAY_ML`. */
export function addWater(total: number, ml: number) {
	return Math.min(MAX_DAY_ML, Math.max(0, Math.round(total + ml)));
}

/**
 * Quantidade digitada em ml: "300", "300 ml", "1,5 L", "2l". Número solto até
 * 10 é litro ("1,5" = 1,5 L); acima, ml. Null se vazio, zero ou fora da faixa.
 */
export function parseWaterAmount(text: string): number | null {
	const match = text
		.trim()
		.toLowerCase()
		.match(/^(\d+(?:[.,]\d+)?)\s*(ml|l)?$/);
	if (!match) return null;
	const value = Number(match[1].replace(",", "."));
	const unit = match[2] ?? (value <= 10 ? "l" : "ml");
	const ml = Math.round(unit === "l" ? value * 1000 : value);
	return ml > 0 && ml <= MAX_ENTRY_ML ? ml : null;
}

/** "250 ml", "1 L", "1,5 L". */
export function waterAmountLabel(ml: number) {
	return ml < 1000
		? `${formatNumber(ml)} ml`
		: `${formatNumber(ml / 1000, 2)} L`;
}

/** How many of today's changes can be undone, newest first. */
export const MAX_UNDO_ENTRIES = 50;

/** Today's total plus the changes that led to it (for undo). */
export interface WaterHistory {
	ml: number;
	/** Applied changes in order: positive added, negative removed. */
	entries: number[];
}

/**
 * Applies a change and remembers what was actually applied (the total stays
 * between 0 and `MAX_DAY_ML`). Returns the same state when nothing changes.
 */
export function recordWater(state: WaterHistory, ml: number): WaterHistory {
	const next = addWater(state.ml, ml);
	if (next === state.ml) return state;
	return {
		ml: next,
		entries: [...state.entries, next - state.ml].slice(-MAX_UNDO_ENTRIES),
	};
}

/**
 * Undoes the latest change. Water saved before the history existed (total
 * larger than the entries) stays. Null when there is nothing to undo.
 */
export function undoWater(state: WaterHistory): WaterHistory | null {
	const last = state.entries.at(-1);
	if (last === undefined) return null;
	return {
		ml: addWater(state.ml, -last),
		entries: state.entries.slice(0, -1),
	};
}

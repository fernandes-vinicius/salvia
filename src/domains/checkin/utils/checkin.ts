import type { Checkin } from "~/domains/checkin/types/checkin-types";

/** Soma `amount` dias a uma data "YYYY-MM-DD". */
export function addDays(day: string, amount: number) {
	const date = new Date(`${day}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + amount);
	return date.toISOString().slice(0, 10);
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_NAMES = [
	"domingo",
	"segunda",
	"terça",
	"quarta",
	"quinta",
	"sexta",
	"sábado",
];

/** Refeições seguidas (comi ou comi a opção) e furadas no dia. */
export function dayCounts(checkins: Checkin[], day: string) {
	let followed = 0;
	let skipped = 0;
	for (const checkin of checkins) {
		if (checkin.day !== day) continue;
		if (checkin.status === "skipped") skipped++;
		else followed++;
	}
	return { followed, skipped };
}

/**
 * Dia "na dieta": seguiu pelo menos tantas refeições quanto o plano tem hoje
 * (conta por número, não por id, pra refeições renomeadas ou recriadas).
 */
export function isFullDay(checkins: Checkin[], day: string, mealCount: number) {
	return mealCount > 0 && dayCounts(checkins, day).followed >= mealCount;
}

/**
 * Dias seguidos na dieta até hoje. Hoje só entra se já estiver completo;
 * enquanto não está, a sequência vale até ontem (não "quebra" de manhã).
 */
export function checkinStreak(
	checkins: Checkin[],
	mealCount: number,
	today: string,
) {
	let day = isFullDay(checkins, today, mealCount) ? today : addDays(today, -1);
	let streak = 0;
	while (isFullDay(checkins, day, mealCount)) {
		streak++;
		day = addDays(day, -1);
	}
	return streak;
}

export type WeekDayState = "full" | "partial" | "skipped" | "none";

export interface WeekDay {
	day: string;
	/** Inicial do dia da semana ("S", "T"…). */
	label: string;
	/** Nome completo, pra leitores de tela. */
	name: string;
	state: WeekDayState;
	followed: number;
	isToday: boolean;
}

/**
 * Últimos 7 dias (o último é hoje) e a adesão: refeições seguidas ÷
 * refeições do plano, só nos dias com algum check-in (null sem nenhum).
 */
export function weekSummary(
	checkins: Checkin[],
	mealCount: number,
	today: string,
) {
	const days: WeekDay[] = [];
	let followedTotal = 0;
	let daysWithCheckin = 0;

	for (let offset = -6; offset <= 0; offset++) {
		const day = addDays(today, offset);
		const { followed, skipped } = dayCounts(checkins, day);
		const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
		let state: WeekDayState = "none";
		if (isFullDay(checkins, day, mealCount)) state = "full";
		else if (followed > 0) state = "partial";
		else if (skipped > 0) state = "skipped";

		if (followed + skipped > 0) {
			daysWithCheckin++;
			followedTotal += Math.min(followed, mealCount);
		}
		days.push({
			day,
			label: WEEKDAYS[weekday],
			name: WEEKDAY_NAMES[weekday],
			state,
			followed,
			isToday: offset === 0,
		});
	}

	const possible = daysWithCheckin * mealCount;
	return {
		days,
		adherence:
			possible > 0 ? Math.round((followedTotal / possible) * 100) : null,
	};
}

// --- Comemorações -----------------------------------------------------------

/** Sequências que ganham comemoração especial. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export type CheckinCelebration = "tap" | "day" | "milestone";

/**
 * Comemoração de uma mudança no check-in de hoje, só pra frente: marcar uma
 * refeição seguida (`tap`), completar o dia (`day`) e, se o dia completo fez
 * a sequência chegar num marco, `milestone`. Desmarcar ou furar: nada.
 */
export function celebrationFor({
	before,
	after,
	mealCount,
	today,
}: {
	before: Checkin[];
	after: Checkin[];
	mealCount: number;
	today: string;
}): CheckinCelebration | null {
	const followedBefore = dayCounts(before, today).followed;
	const followedAfter = dayCounts(after, today).followed;
	if (followedAfter <= followedBefore) return null;

	const completedNow =
		!isFullDay(before, today, mealCount) && isFullDay(after, today, mealCount);
	if (!completedNow) return "tap";

	const streak = checkinStreak(after, mealCount, today);
	return (STREAK_MILESTONES as readonly number[]).includes(streak)
		? "milestone"
		: "day";
}

/** Frase do marco ("Uma semana inteira na dieta"). */
export function milestoneMessage(streak: number) {
	if (streak >= 100) return "Cem dias seguidos. Isso já é hábito!";
	if (streak >= 60) return "Dois meses seguindo a dieta. Impressionante.";
	if (streak >= 30) return "Um mês inteiro na dieta. Que constância!";
	if (streak >= 14) return "Duas semanas seguidas. O resultado vem.";
	if (streak >= 7) return "Uma semana inteira na dieta.";
	return "Três dias seguidos. Bom começo!";
}

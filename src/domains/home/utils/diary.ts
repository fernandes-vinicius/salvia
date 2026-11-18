import type { Checkin } from "~/domains/checkin/types/checkin-types";
import { addDays, dayCounts, isFullDay } from "~/domains/checkin/utils/checkin";

/** Até quantos dias pra trás dá pra abrir (e marcar) no diário do Início. */
export const DIARY_DAYS_BACK = 365;

const WEEKDAYS = [
	"domingo",
	"segunda",
	"terça",
	"quarta",
	"quinta",
	"sexta",
	"sábado",
];
const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
	"janeiro",
	"fevereiro",
	"março",
	"abril",
	"maio",
	"junho",
	"julho",
	"agosto",
	"setembro",
	"outubro",
	"novembro",
	"dezembro",
];
const MONTHS_SHORT = [
	"jan.",
	"fev.",
	"mar.",
	"abr.",
	"maio",
	"jun.",
	"jul.",
	"ago.",
	"set.",
	"out.",
	"nov.",
	"dez.",
];

function parts(day: string) {
	const date = new Date(`${day}T12:00:00Z`);
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		date: date.getUTCDate(),
		weekday: date.getUTCDay(),
	};
}

export function earliestDiaryDay(today: string) {
	return addDays(today, -DIARY_DAYS_BACK);
}

/** "YYYY-MM-DD" que existe, entre o começo da janela e hoje. */
export function isDiaryDay(value: unknown, today: string): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}
	// Datas como 30/02 viram outro dia: só vale se ida e volta batem.
	if (addDays(value, 0) !== value) return false;
	return value >= earliestDiaryDay(today) && value <= today;
}

/** Dia aberto no diário (`?dia=`): o da URL quando vale, senão hoje. */
export function diaryDay(raw: string | null | undefined, today: string) {
	return isDiaryDay(raw, today) ? raw : today;
}

/** Título e linha de baixo do seletor de data ("Ontem" / "ter, 17 de novembro"). */
export function diaryDayLabel(day: string, today: string) {
	const { year, month, date, weekday } = parts(day);
	const sameYear = year === parts(today).year;
	const dayMonth = `${date} de ${MONTHS[month]}${sameYear ? "" : ` de ${year}`}`;
	if (day === today) {
		return {
			title: "Hoje",
			subtitle: `${WEEKDAYS_SHORT[weekday]}, ${dayMonth}`,
		};
	}
	if (day === addDays(today, -1)) {
		return {
			title: "Ontem",
			subtitle: `${WEEKDAYS_SHORT[weekday]}, ${dayMonth}`,
		};
	}
	const name = WEEKDAYS[weekday];
	const title = `${name.charAt(0).toUpperCase()}${name.slice(1)}${weekday > 0 && weekday < 6 ? "-feira" : ""}`;
	return { title, subtitle: dayMonth };
}

/** "terça-feira, 17 de novembro de 2026" (cabeçalho do relatório). */
export function diaryLongDate(day: string) {
	const { year, month, date, weekday } = parts(day);
	const name = `${WEEKDAYS[weekday]}${weekday > 0 && weekday < 6 ? "-feira" : ""}`;
	return `${name}, ${date} de ${MONTHS[month]} de ${year}`;
}

/** O dia no meio de uma frase: "hoje", "ontem, 17 de nov.", "segunda, 16 de nov.". */
export function diaryDayPhrase(day: string, today: string) {
	if (day === today) return "hoje";
	const { year, month, date, weekday } = parts(day);
	const sameYear = year === parts(today).year;
	const name = day === addDays(today, -1) ? "ontem" : WEEKDAYS[weekday];
	return `${name}, ${date} de ${MONTHS_SHORT[month]}${sameYear ? "" : ` de ${year}`}`;
}

const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Inicial do dia da semana ("D", "S", "T"…). */
export function weekdayLetter(day: string) {
	return WEEKDAY_LETTERS[parts(day).weekday];
}

/** Os 7 dias (domingo a sábado) da semana que contém `day`. */
export function weekOf(day: string) {
	const sunday = addDays(day, -parts(day).weekday);
	return Array.from({ length: 7 }, (_, index) => addDays(sunday, index));
}

/** Dias do mês "YYYY-MM" pro calendário, com `null` antes do dia 1 (começa no domingo). */
export function monthGrid(month: string): (string | null)[] {
	const first = `${month}-01`;
	const blanks: null[] = Array.from(
		{ length: parts(first).weekday },
		() => null,
	);
	const days: string[] = [];
	for (let day = first; day.startsWith(month); day = addDays(day, 1)) {
		days.push(day);
	}
	return [...blanks, ...days];
}

/** "YYYY-MM" somado de `amount` meses. */
export function shiftMonth(month: string, amount: number) {
	const [year, monthIndex] = month.split("-").map(Number);
	const date = new Date(Date.UTC(year, monthIndex - 1 + amount, 1));
	return date.toISOString().slice(0, 7);
}

/** Nome do mês com o ano ("Novembro de 2026"), pro topo do calendário. */
export function monthTitle(month: string) {
	const { year, month: index } = parts(`${month}-01`);
	const name = MONTHS[index];
	return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

export type DiaryDayKind = "full" | "partial" | "none";

/** Bolinha do dia no seletor: completo, com alguma marcação ou nada. */
export function diaryDayKind(
	checkins: Checkin[],
	mealCount: number,
	day: string,
): DiaryDayKind {
	if (isFullDay(checkins, day, mealCount)) return "full";
	const { followed, skipped } = dayCounts(checkins, day);
	return followed + skipped > 0 ? "partial" : "none";
}

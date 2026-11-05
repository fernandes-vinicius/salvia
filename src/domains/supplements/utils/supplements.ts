import type {
	Supplement,
	SupplementDays,
	SupplementMealRef,
	SupplementTiming,
	SupplementUnit,
} from "~/domains/supplements/types/supplement-types";
import { formatNumber } from "~/shared/lib/format";

/** Rótulo da unidade: [singular, plural] (iguais quando não flexiona). */
export const UNIT_NAMES: Record<SupplementUnit, [string, string]> = {
	g: ["g", "g"],
	mg: ["mg", "mg"],
	mcg: ["mcg", "mcg"],
	ml: ["ml", "ml"],
	capsule: ["cápsula", "cápsulas"],
	tablet: ["comprimido", "comprimidos"],
	scoop: ["dose", "doses"],
	drop: ["gota", "gotas"],
	sachet: ["sachê", "sachês"],
	iu: ["UI", "UI"],
};

export function doseLabel(dose: number, unit: SupplementUnit) {
	const [one, many] = UNIT_NAMES[unit];
	return `${formatNumber(dose, 2)} ${dose > 1 ? many : one}`;
}

export const TIMING_LABELS: Record<SupplementTiming, string> = {
	meal: "Junto de uma refeição",
	before_workout: "Antes do treino",
	after_workout: "Depois do treino",
	wake_up: "Ao acordar",
	bedtime: "Antes de dormir",
	time: "Num horário",
};

export function timingLabel(
	supplement: Pick<Supplement, "timing" | "mealId" | "time">,
	meals: SupplementMealRef[],
) {
	if (supplement.timing === "meal") {
		const meal = meals.find((m) => m.id === supplement.mealId);
		if (!meal) return TIMING_LABELS.meal;
		return meal.time ? `${meal.name} · ${meal.time}` : meal.name;
	}
	if (supplement.timing === "time" && supplement.time) {
		return `Às ${supplement.time}`;
	}
	return TIMING_LABELS[supplement.timing];
}

/** Semana começando na segunda (0 = domingo vai pro fim). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const DAYS_LABELS: Record<SupplementDays, string> = {
	every_day: "Todo dia",
	training_days: "Dias de treino",
	weekdays: "Escolher dias",
};

export function daysLabel(days: SupplementDays, weekdays: number[]) {
	if (days !== "weekdays") return DAYS_LABELS[days];
	const picked = WEEK_ORDER.filter((day) => weekdays.includes(day));
	if (picked.length === 7) return DAYS_LABELS.every_day;
	const names = picked.map((day) => WEEKDAY_SHORT[day]);
	if (names.length <= 1) return names.join("");
	return `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
}

const CALORIC = [
	"whey",
	"albumina",
	"hipercal",
	"caseina",
	"maltodextrina",
	"dextrose",
	"palatinose",
	"waxy",
	"barra",
	"barrinha",
	"proteina",
	"massa",
];

const normalize = (text: string) =>
	text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

/**
 * Suplemento com calorias (whey, albumina…): deve entrar como alimento numa
 * refeição pra contar na meta. Só um aviso, nunca bloqueia.
 */
export function looksCaloric(name: string) {
	const words = normalize(name);
	return CALORIC.some((word) => words.includes(word));
}

/** Sobe (-1) ou desce (+1) um suplemento na lista, sem passar das pontas. */
export function moveSupplement<T extends { id: string }>(
	list: T[],
	id: string,
	direction: -1 | 1,
) {
	const index = list.findIndex((item) => item.id === id);
	const target = index + direction;
	if (index < 0 || target < 0 || target >= list.length) return list;
	const next = [...list];
	[next[index], next[target]] = [next[target], next[index]];
	return next;
}

/** Dia da semana (0 = domingo) de uma data "YYYY-MM-DD", sem depender do fuso. */
function weekdayOf(day: string) {
	return new Date(`${day}T12:00:00Z`).getUTCDay();
}

/**
 * Suplementos que valem no dia. "Dias de treino" aparecem todo dia (o perfil
 * não sabe em quais dias a pessoa treina); a tela marca como "se treinar".
 */
export function supplementsForDay<
	T extends Pick<Supplement, "days" | "weekdays">,
>(supplements: T[], day: string) {
	const weekday = weekdayOf(day);
	return supplements.filter(
		(supplement) =>
			supplement.days !== "weekdays" || supplement.weekdays.includes(weekday),
	);
}

/** Os ligados à refeição que valem no dia (lembrete na próxima refeição). */
export function mealSupplements<
	T extends Pick<Supplement, "days" | "weekdays" | "timing" | "mealId">,
>(supplements: T[], mealId: string, day: string) {
	return supplementsForDay(supplements, day).filter(
		(supplement) =>
			supplement.timing === "meal" && supplement.mealId === mealId,
	);
}

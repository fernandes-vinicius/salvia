export const SUPPLEMENT_UNITS = [
	"g",
	"mg",
	"mcg",
	"ml",
	"capsule",
	"tablet",
	"scoop",
	"drop",
	"sachet",
	"iu",
] as const;
export type SupplementUnit = (typeof SUPPLEMENT_UNITS)[number];

export const SUPPLEMENT_TIMINGS = [
	"meal",
	"before_workout",
	"after_workout",
	"wake_up",
	"bedtime",
	"time",
] as const;
export type SupplementTiming = (typeof SUPPLEMENT_TIMINGS)[number];

export const SUPPLEMENT_DAYS = [
	"every_day",
	"training_days",
	"weekdays",
] as const;
export type SupplementDays = (typeof SUPPLEMENT_DAYS)[number];

/** Suplemento da dieta: só anotação, não entra nas calorias nem nos macros. */
export interface Supplement {
	id: string;
	name: string;
	dose: number;
	unit: SupplementUnit;
	timing: SupplementTiming;
	/** Refeição quando `timing` = "meal" (nulo se ela foi apagada). */
	mealId: string | null;
	/** "HH:MM" quando `timing` = "time". */
	time: string | null;
	days: SupplementDays;
	/** 0 = domingo … 6 = sábado, quando `days` = "weekdays". */
	weekdays: number[];
	note: string | null;
}

/** O mínimo da refeição pra escrever "quando" (nome e horário). */
export interface SupplementMealRef {
	id: string;
	name: string;
	time: string | null;
}

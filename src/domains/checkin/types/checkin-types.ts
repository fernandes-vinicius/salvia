export type CheckinStatus = "done" | "option" | "skipped";

export interface Checkin {
	/** Nulo quando a refeição foi apagada (o histórico continua). */
	mealId: string | null;
	/** "YYYY-MM-DD" no fuso do app. */
	day: string;
	status: CheckinStatus;
}

/** Refeição que aparece no check-in de hoje. */
export interface CheckinMeal {
	id: string;
	name: string;
	time: string | null;
	/** Algum alimento tem opção ("ou 1 banana"): mostra "Comi a opção". */
	hasOptions: boolean;
}

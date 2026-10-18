/** Fuso do app: as datas "do dia" (medidas, atividade) seguem Brasília. */
export const APP_TIME_ZONE = "America/Sao_Paulo";

/** Data local "YYYY-MM-DD" no fuso do app (servidor roda em UTC). */
export function localDateString(date: Date = new Date()) {
	return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(
		date,
	);
}

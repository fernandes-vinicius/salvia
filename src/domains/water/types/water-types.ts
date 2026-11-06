/** Água bebida num dia. */
export interface WaterDay {
	/** "YYYY-MM-DD" no fuso do app. */
	day: string;
	/** Total bebido (ml). */
	ml: number;
	/** Recomendado daquele dia (ml), guardado pra a meta antiga não mudar. */
	targetMl: number;
}

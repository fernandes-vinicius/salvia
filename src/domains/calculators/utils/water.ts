export type Climate = "mild" | "hot" | "sweaty";

/** Base pra adultos saudáveis: ~35 ml por kg (estimativa clínica usual). */
export const WATER_MIN_ML_PER_KG = 35;
/** Quem treina pra ganhar massa: base um pouco maior, ~40 ml por kg. */
export const WATER_TRAINING_ML_PER_KG = 40;

/**
 * Reposição do suor por hora de treino (ml). A perda típica fica entre
 * 0,4 e 0,8 L/h (ACSM) e passa de 1 L/h no calor ou em quem sua muito.
 */
export const SWEAT_ML_PER_HOUR: Record<Climate, number> = {
	mild: 500,
	hot: 750,
	sweaty: 1000,
};

/** Extra no dia todo em clima quente (suor fora do treino). */
const HOT_DAY_EXTRA_ML: Record<Climate, number> = {
	mild: 0,
	hot: 500,
	sweaty: 500,
};

export const GLASS_ML = 250;
export const BOTTLE_ML = 500;

export interface WaterInput {
	weightKg: number;
	trainingMinutes: number;
	climate: Climate;
}

export interface WaterResult {
	/** Mínimo do dia (ml), pra dia de descanso em clima ameno. */
	minimumMl: number;
	/** Recomendado em dia de treino (ml): base maior + suor do treino e do calor. */
	recommendedMl: number;
	/** Quanto do recomendado vem do treino (ml). */
	trainingMl: number;
}

/** Arredonda pra 100 ml (precisão que faz sentido pra beber). */
const round100 = (ml: number) => Math.round(ml / 100) * 100;

// Estimativa de água por dia (bebida; a comida ainda soma ~20% a mais).
export function waterPerDay({
	weightKg,
	trainingMinutes,
	climate,
}: WaterInput): WaterResult {
	const trainingMl = (trainingMinutes / 60) * SWEAT_ML_PER_HOUR[climate];
	return {
		minimumMl: round100(weightKg * WATER_MIN_ML_PER_KG),
		recommendedMl: round100(
			weightKg * WATER_TRAINING_ML_PER_KG +
				trainingMl +
				HOT_DAY_EXTRA_ML[climate],
		),
		trainingMl: round100(trainingMl),
	};
}

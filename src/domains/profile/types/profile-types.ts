export type Sex = "male" | "female";

/** Rotina de um tipo de treino (musculação ou cardio). */
export interface TrainingRoutine {
	enabled: boolean;
	daysPerWeek: number;
	minutesPerSession: number;
	/** Intensidade em MET (equivalente metabólico). */
	met: number;
}

export interface BodyProfile {
	sex: Sex;
	ageYears: number;
	weightKg: number;
	heightCm: number;
	/** Movimento do dia a dia SEM treino (NEAT), multiplica a TMB. */
	neatFactor: number;
	strength: TrainingRoutine;
	cardio: TrainingRoutine;
}

/** Gasto diário detalhado (kcal/dia). */
export interface EnergyBreakdown {
	/** Taxa metabólica basal: repouso absoluto. */
	bmr: number;
	/** Acréscimo do movimento do dia a dia (TMB × NEAT − TMB). */
	daily: number;
	strength: number;
	cardio: number;
	/** Efeito térmico dos alimentos (digestão). */
	digestion: number;
	/** Gasto calórico diário total (GCD). */
	tdee: number;
}

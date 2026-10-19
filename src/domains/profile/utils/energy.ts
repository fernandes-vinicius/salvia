import type {
	BodyProfile,
	EnergyBreakdown,
	Sex,
	TrainingRoutine,
} from "~/domains/profile/types/profile-types";

// Método fatorial: GCD = (TMB × NEAT + treinos) × (1 + digestão).
// O NEAT cobre só o dia a dia; treinos entram à parte por MET. Evita contar
// o treino duas vezes (o que os fatores clássicos 1,2–1,9 faziam e
// superestimavam o gasto — ver docs/roadmap.md).

export interface Option {
	value: number;
	label: string;
	description: string;
	tags?: string[];
}

export const NEAT_LEVELS: Option[] = [
	{
		value: 1.1,
		label: "Sedentário",
		description: "Passa a maior parte do dia sentado ou deitado.",
		tags: ["Home office", "Estudo"],
	},
	{
		value: 1.15,
		label: "Levemente ativo",
		description: "Alterna o tempo sentado com pequenas caminhadas e tarefas.",
		tags: ["Escritório", "Tarefas de casa"],
	},
	{
		value: 1.2,
		label: "Moderadamente ativo",
		description: "Fica em pé boa parte do dia e caminha com frequência.",
		tags: ["Professor", "Vendedor"],
	},
	{
		value: 1.25,
		label: "Bastante ativo",
		description: "Em pé quase o dia todo, em movimento constante.",
		tags: ["Garçom", "Enfermagem"],
	},
	{
		value: 1.3,
		label: "Extremamente ativo",
		description: "Trabalho físico pesado e ritmo intenso o dia todo.",
		tags: ["Obra", "Carga e descarga"],
	},
];

export const STRENGTH_INTENSITIES: Option[] = [
	{
		value: 3.5,
		label: "Muito leve",
		description: "Sem cargas ou para reabilitação.",
	},
	{
		value: 4.5,
		label: "Leve",
		description: "Com cargas, mas sem desconforto.",
	},
	{
		value: 5.5,
		label: "Moderado",
		description: "Há desafio, mas o desconforto é tolerável.",
	},
	{
		value: 6.5,
		label: "Pesado",
		description: "Carga máxima, perto do limite.",
	},
	{
		value: 7.5,
		label: "Muito pesado",
		description: "Muito volume e técnicas avançadas.",
	},
];

export const CARDIO_INTENSITIES: Option[] = [
	{
		value: 5,
		label: "Muito leve",
		description: "Caminhada no parque.",
	},
	{
		value: 6.25,
		label: "Leve",
		description: "Caminhada acelerada ou com inclinação.",
	},
	{
		value: 7.5,
		label: "Moderado",
		description: "Ainda dá para manter uma conversa.",
	},
	{
		value: 8.75,
		label: "Intenso",
		description: "Sem fôlego para manter uma conversa.",
	},
	{
		value: 10,
		label: "Muito intenso",
		description: "Tiros (sprints) e HIIT no limite.",
	},
];

export const TRAINING_RANGES = {
	daysPerWeek: { min: 1, max: 7, step: 1 },
	strengthMinutes: { min: 20, max: 180, step: 5 },
	cardioMinutes: { min: 10, max: 120, step: 5 },
} as const;

/** Efeito térmico dos alimentos: ~10% do gasto vai para a digestão. */
export const DIGESTION_RATE = 0.1;

export function findOption(options: Option[], value: number) {
	return options.find((option) => Math.abs(option.value - value) < 0.001);
}

export type BmrFormula = "mifflin" | "harris";

export interface BmrFormulaOption {
	value: BmrFormula;
	label: string;
	description: string;
}

// Escolhida em Configurações. Padrão: Mifflin-St Jeor (1990), a mais usada
// hoje e a da calculadora de referência (hipertrofia.org). Harris-Benedict
// original (1919) é a da planilha e tende a dar valores mais altos.
export const BMR_FORMULAS: BmrFormulaOption[] = [
	{
		value: "mifflin",
		label: "Mifflin-St Jeor",
		description:
			"A mais usada por nutricionistas hoje e a mais precisa para a maioria das pessoas.",
	},
	{
		value: "harris",
		label: "Harris-Benedict",
		description:
			"A clássica, usada na planilha original. Costuma dar um valor um pouco mais alto.",
	},
];

export const DEFAULT_BMR_FORMULA: BmrFormula = "mifflin";

const MIFFLIN_SEX_CONSTANT: Record<Sex, number> = { male: 5, female: -161 };

const HARRIS_COEFFICIENTS: Record<
	Sex,
	{ base: number; weight: number; height: number; age: number }
> = {
	male: { base: 66.47, weight: 13.75, height: 5, age: 6.8 },
	female: { base: 655.1, weight: 9.563, height: 1.85, age: 4.676 },
};

type BmrInput = Pick<BodyProfile, "sex" | "weightKg" | "heightCm" | "ageYears">;

/** Taxa metabólica basal (kcal/dia): gasto em repouso absoluto. */
export function calculateBmr(
	{ sex, weightKg, heightCm, ageYears }: BmrInput,
	formula: BmrFormula = DEFAULT_BMR_FORMULA,
) {
	if (formula === "harris") {
		const c = HARRIS_COEFFICIENTS[sex];
		return (
			c.base + c.weight * weightKg + c.height * heightCm - c.age * ageYears
		);
	}
	return (
		10 * weightKg + 6.25 * heightCm - 5 * ageYears + MIFFLIN_SEX_CONSTANT[sex]
	);
}

/**
 * Média diária (kcal/dia) de um treino. Usa MET líquido (MET − 1) porque o
 * repouso daquele tempo já está na TMB.
 */
export function calculateTrainingKcalPerDay(
	routine: TrainingRoutine,
	weightKg: number,
) {
	if (!routine.enabled) return 0;
	const perSession =
		(routine.met - 1) * weightKg * (routine.minutesPerSession / 60);
	return (perSession * routine.daysPerWeek) / 7;
}

export function calculateEnergy(
	profile: BodyProfile,
	formula: BmrFormula = DEFAULT_BMR_FORMULA,
): EnergyBreakdown {
	const bmr = calculateBmr(profile, formula);
	const daily = bmr * (profile.neatFactor - 1);
	const strength = calculateTrainingKcalPerDay(
		profile.strength,
		profile.weightKg,
	);
	const cardio = calculateTrainingKcalPerDay(profile.cardio, profile.weightKg);
	const beforeDigestion = bmr + daily + strength + cardio;
	const digestion = beforeDigestion * DIGESTION_RATE;

	return {
		bmr,
		daily,
		strength,
		cardio,
		digestion,
		tdee: beforeDigestion + digestion,
	};
}

/** Gasto calórico diário (kcal/dia). */
export function calculateTdee(
	profile: BodyProfile,
	formula: BmrFormula = DEFAULT_BMR_FORMULA,
) {
	return calculateEnergy(profile, formula).tdee;
}

// Ponto de partida pra quem ainda não salvou nada: a pessoa de referência da
// dieta de 2.000 kcal (20 anos, 70 kg, 170 cm, sedentária, sem treino ≈ 2.018
// kcal com Mifflin-St Jeor). A tela deixa claro que são valores de exemplo.
export const EXAMPLE_PROFILE: BodyProfile = {
	sex: "male",
	ageYears: 20,
	weightKg: 70,
	heightCm: 170,
	neatFactor: 1.1,
	strength: { enabled: false, daysPerWeek: 3, minutesPerSession: 60, met: 5.5 },
	cardio: { enabled: false, daysPerWeek: 3, minutesPerSession: 30, met: 7.5 },
};

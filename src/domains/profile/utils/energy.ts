import type { BodyProfile, Sex } from "~/domains/profile/types/profile-types";

export interface ActivityLevel {
	factor: number;
	label: string;
	description: string;
	/** Resumo escaneável: como é o trabalho e o exercício nesse nível. */
	tags: string[];
}

// Fatores de atividade (FA) de Harris-Benedict pela frequência/intensidade
// de exercício (tabela de referência adotada em out/2026).
export const ACTIVITY_LEVELS: ActivityLevel[] = [
	{
		factor: 1.2,
		label: "Sedentário",
		description: "Pouco ou nenhum exercício.",
		tags: ["Sem treino"],
	},
	{
		factor: 1.375,
		label: "Pouco ativo",
		description: "Exercícios ou esportes leves, de 1 a 3 vezes por semana.",
		tags: ["Leve", "1 a 3× por semana"],
	},
	{
		factor: 1.55,
		label: "Moderado",
		description: "Exercícios ou esportes moderados, de 3 a 5 vezes por semana.",
		tags: ["Moderado", "3 a 5× por semana"],
	},
	{
		factor: 1.725,
		label: "Muito ativo",
		description: "Exercícios ou esportes pesados, de 6 a 7 vezes por semana.",
		tags: ["Pesado", "6 a 7× por semana"],
	},
	{
		factor: 1.9,
		label: "Extremamente ativo",
		description: "Exercício, esporte ou trabalho intenso todos os dias.",
		tags: ["Intenso", "Todos os dias"],
	},
];

export function findActivityLevel(factor: number) {
	return ACTIVITY_LEVELS.find(
		(level) => Math.abs(level.factor - factor) < 0.001,
	);
}

// Harris-Benedict original — a mesma fórmula da planilha (versão masculina);
// a feminina não existia na planilha. Ver docs/planilha-calculos.md.
const BMR_COEFFICIENTS: Record<
	Sex,
	{ base: number; weight: number; height: number; age: number }
> = {
	male: { base: 66.47, weight: 13.75, height: 5, age: 6.8 },
	female: { base: 655.1, weight: 9.563, height: 1.85, age: 4.676 },
};

/** Taxa metabólica basal (kcal/dia): gasto em repouso absoluto. */
export function calculateBmr({
	sex,
	weightKg,
	heightCm,
	ageYears,
}: Pick<BodyProfile, "sex" | "weightKg" | "heightCm" | "ageYears">) {
	const c = BMR_COEFFICIENTS[sex];
	return c.base + c.weight * weightKg + c.height * heightCm - c.age * ageYears;
}

/** Gasto calórico diário (kcal/dia) = TMB × fator de atividade. */
export function calculateTdee(profile: BodyProfile) {
	return calculateBmr(profile) * profile.activityFactor;
}

// Ponto de partida pra quem ainda não salvou nada (mesmos valores da
// planilha original). A tela deixa claro que são valores de exemplo.
export const EXAMPLE_PROFILE: BodyProfile = {
	sex: "male",
	ageYears: 30,
	weightKg: 70,
	heightCm: 170,
	activityFactor: 1.375,
};

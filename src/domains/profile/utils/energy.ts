import type { BodyProfile, Sex } from "~/domains/profile/types/profile-types";

export interface ActivityLevel {
	factor: number;
	label: string;
	description: string;
	/** Resumo escaneável: como é o trabalho e o exercício nesse nível. */
	tags: string[];
}

// Fatores de atividade (FA) usados na dieta original, descritos pelo dia a
// dia (trabalho + exercício) pra pessoa se encaixar sem saber o número.
export const ACTIVITY_LEVELS: ActivityLevel[] = [
	{
		factor: 1,
		label: "Sedentário",
		description: "Não trabalha e não pratica nenhuma atividade física.",
		tags: ["Não trabalha", "Sem exercício"],
	},
	{
		factor: 1.2,
		label: "Muito pouco ativo",
		description:
			"Trabalho sem esforço físico (ex.: escritório) e nenhum exercício no dia.",
		tags: ["Trabalho sem esforço", "Sem exercício"],
	},
	{
		factor: 1.375,
		label: "Pouco ativo",
		description:
			"Trabalho sem esforço físico e alguma atividade leve no dia, como uma caminhada.",
		tags: ["Trabalho sem esforço", "Atividade leve"],
	},
	{
		factor: 1.55,
		label: "Moderadamente ativo",
		description:
			"Trabalho sem esforço físico, alguma atividade no dia e treino de musculação.",
		tags: ["Trabalho sem esforço", "Atividade leve", "Musculação"],
	},
	{
		factor: 1.725,
		label: "Altamente ativo",
		description:
			"Musculação e trabalho que exige esforço físico. Ou trabalho sem esforço, mas com musculação e outro esporte intenso no mesmo dia.",
		tags: ["Musculação", "Trabalho braçal ou esporte intenso"],
	},
	{
		factor: 1.9,
		label: "Extremamente ativo",
		description:
			"Musculação e outro esporte intenso no mesmo dia, além de um trabalho que exige esforço físico.",
		tags: ["Trabalho braçal", "Musculação", "Esporte intenso"],
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

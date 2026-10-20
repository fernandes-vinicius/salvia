import type { Sex } from "~/domains/profile/types/profile-types";

// IMC (OMS) e % de gordura estimado pelo método da Marinha dos EUA (fita
// métrica: pescoço, cintura e, nas mulheres, quadril). Estimativas: não
// separam músculo de gordura como um exame (DEXA, bioimpedância).

export interface Category {
	label: string;
	/** Frase curta em linguagem simples. */
	text: string;
}

export function bmi(weightKg: number, heightCm: number) {
	const meters = heightCm / 100;
	return weightKg / (meters * meters);
}

const BMI_CATEGORIES: { below: number; category: Category }[] = [
	{
		below: 18.5,
		category: {
			label: "Abaixo do peso",
			text: "Abaixo da faixa considerada saudável pra sua altura.",
		},
	},
	{
		below: 25,
		category: {
			label: "Peso adequado",
			text: "Dentro da faixa considerada saudável pra sua altura.",
		},
	},
	{
		below: 30,
		category: {
			label: "Sobrepeso",
			text: "Um pouco acima da faixa saudável. Quem tem muito músculo também pode cair aqui.",
		},
	},
	{
		below: 35,
		category: {
			label: "Obesidade grau I",
			text: "Acima da faixa saudável. Vale conversar com um profissional de saúde.",
		},
	},
	{
		below: 40,
		category: {
			label: "Obesidade grau II",
			text: "Bem acima da faixa saudável. Procure acompanhamento de um profissional de saúde.",
		},
	},
	{
		below: Number.POSITIVE_INFINITY,
		category: {
			label: "Obesidade grau III",
			text: "Muito acima da faixa saudável. Procure acompanhamento de um profissional de saúde.",
		},
	},
];

/** Faixa da OMS (o limite de baixo entra na faixa de cima: 25 = sobrepeso). */
export function bmiCategory(value: number): Category {
	return (
		BMI_CATEGORIES.find((entry) => value < entry.below) ??
		BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
	).category;
}

/** Peso do IMC 18,5 a 24,9 pra altura. */
export function healthyWeightRange(heightCm: number) {
	const meters2 = (heightCm / 100) ** 2;
	return { min: 18.5 * meters2, max: 24.9 * meters2 };
}

export interface NavyInput {
	sex: Sex;
	heightCm: number;
	neckCm: number;
	waistCm: number;
	/** Obrigatório pra mulheres. */
	hipsCm?: number;
}

/** % de gordura (fórmula da Marinha dos EUA, em cm). Null se as medidas não fecham. */
export function bodyFatNavy({
	sex,
	heightCm,
	neckCm,
	waistCm,
	hipsCm,
}: NavyInput): number | null {
	const log = Math.log10;
	if (sex === "male") {
		if (waistCm <= neckCm) return null;
		return (
			495 /
				(1.0324 - 0.19077 * log(waistCm - neckCm) + 0.15456 * log(heightCm)) -
			450
		);
	}
	if (!hipsCm || waistCm + hipsCm <= neckCm) return null;
	return (
		495 /
			(1.29579 -
				0.35004 * log(waistCm + hipsCm - neckCm) +
				0.221 * log(heightCm)) -
		450
	);
}

// Faixas do American Council on Exercise (ACE), em %.
const FAT_LIMITS: Record<
	Sex,
	{ essential: number; athlete: number; fit: number; average: number }
> = {
	male: { essential: 6, athlete: 14, fit: 18, average: 25 },
	female: { essential: 14, athlete: 21, fit: 25, average: 32 },
};

export function bodyFatCategory(percent: number, sex: Sex): Category {
	const limits = FAT_LIMITS[sex];
	if (percent < limits.essential) {
		return {
			label: "Muito baixo",
			text: "Abaixo da gordura essencial pro corpo funcionar bem. Confira as medidas.",
		};
	}
	if (percent < limits.athlete) {
		return {
			label: "Atleta",
			text: "Nível de quem compete ou treina pesado há anos.",
		};
	}
	if (percent < limits.fit) {
		return { label: "Em forma", text: "Boa definição, sem extremos." };
	}
	if (percent < limits.average) {
		return { label: "Média", text: "Na média da população adulta." };
	}
	return {
		label: "Acima da média",
		text: "Acima da média. Diminuir a gordura costuma trazer ganho de saúde.",
	};
}

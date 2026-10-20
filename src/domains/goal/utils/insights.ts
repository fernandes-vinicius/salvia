import type { Objective } from "~/domains/goal/types/goal-types";
import { weeklyChangeKg } from "~/domains/goal/utils/goal";
import type { ProteinCounting } from "~/domains/goal/utils/protein-counting";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { formatFixed, formatNumber } from "~/shared/lib/format";

// "Por que isso importa?": dicas curtas da Meta com as faixas de referência
// aplicadas aos dados da pessoa. `attention` = o valor escolhido está fora
// da faixa (a dica vira "Vale conferir"), nunca bloqueia.

export interface Insight {
	text: string;
	attention: boolean;
}

const kg = (value: number) => formatFixed(value);
const pct = (value: number) => formatNumber(value, 1);

export function paceInsight({
	objective,
	calorieAdjustment,
	weightKg,
}: {
	objective: Objective;
	calorieAdjustment: number;
	weightKg: number;
}): Insight | null {
	if (objective === "maintain") return null;
	const weekly = Math.abs(weeklyChangeKg(calorieAdjustment));
	const share = (weekly / weightKg) * 100;

	if (objective === "lose") {
		return {
			text: `Perder de 0,5% a 1% do peso por semana ajuda a manter o músculo e a fome sob controle. Pra você, isso é de ${kg(weightKg * 0.005)} a ${kg(weightKg * 0.01)} kg por semana; no ritmo escolhido, cerca de ${kg(weekly)} kg (${pct(share)}%).${share > 1 ? " Mais rápido que isso costuma custar músculo e ser difícil de manter." : ""}`,
			attention: share > 1,
		};
	}
	return {
		text: `Ganhando de 0,1% a 0,5% do peso por semana, a maior parte vira músculo (o começo da faixa pra quem treina há anos, o fim pra quem está começando). Pra você, de ${kg(weightKg * 0.001)} a ${kg(weightKg * 0.005)} kg por semana; no ritmo escolhido, cerca de ${kg(weekly)} kg.${share > 0.5 ? " Acima disso, sobra mais gordura." : ""}`,
		attention: share > 0.5,
	};
}

export function proteinInsight({
	objective,
	proteinPerKg,
	weightKg,
	counting,
}: {
	objective: Objective;
	proteinPerKg: number;
	weightKg: number;
	counting: ProteinCounting;
}): Insight {
	const range = `${formatNumber(weightKg * 1.6)} a ${formatNumber(weightKg * 2.2)} g`;
	const losing =
		objective === "lose"
			? " Perdendo peso, ficar perto de 2,2 g/kg ajuda a não perder músculo."
			: "";
	if (counting === "animal") {
		return {
			text: `Pra quem treina, a referência é de 1,6 a 2,2 g/kg de proteína total por dia (${range} pra você). Como você conta só a animal, a vegetal (feijão, arroz, pão) soma em cima, então a total fica maior que a meta.${losing}`,
			attention: proteinPerKg < 1.2,
		};
	}
	return {
		text: `Pra quem treina, a referência é de 1,6 a 2,2 g/kg por dia, divididos nas refeições: pra você, ${range}.${losing} Mais que isso não ganha músculo a mais, só ocupa calorias.`,
		attention: proteinPerKg < 1.6,
	};
}

export function fatInsight({
	fatPerKg,
	weightKg,
	calories,
}: {
	fatPerKg: number;
	weightKg: number;
	calories: number;
}): Insight {
	const share = calories > 0 ? ((fatPerKg * weightKg * 9) / calories) * 100 : 0;
	const low = fatPerKg < 0.5 || share < 20;
	return {
		text: `A faixa usual é de 0,6 a 1,0 g/kg (${formatNumber(weightKg * 0.6)} a ${formatNumber(weightKg * 1)} g pra você), sem descer de 0,5 g/kg nem de uns 20% das calorias, pela saúde hormonal. Hoje a gordura é ${formatNumber(share)}% das suas calorias. Quem segura o músculo é a proteína com o treino, não a gordura: baixar um pouco libera calorias pro carboidrato, que ajuda no treino.`,
		attention: low,
	};
}

/** Horas de treino por semana (musculação + cardio ligados). */
export function weeklyTrainingHours(
	profile: Pick<BodyProfile, "strength" | "cardio">,
) {
	const minutes = [profile.strength, profile.cardio]
		.filter((routine) => routine.enabled)
		.reduce((sum, r) => sum + r.daysPerWeek * r.minutesPerSession, 0);
	return minutes / 60;
}

/** Acima disso (≈ 1 h por dia), a faixa de carbo sobe pra 5–7 g/kg. */
const HIGH_VOLUME_HOURS = 7;

export function carbsInsight({
	objective,
	carbsPerKg,
	weightKg,
	trainingHours,
}: {
	objective: Objective;
	carbsPerKg: number;
	weightKg: number;
	trainingHours: number;
}): Insight {
	const [min, max] = trainingHours >= HIGH_VOLUME_HOURS ? [5, 7] : [3, 5];
	const below = carbsPerKg < min;
	const hours = formatNumber(trainingHours, 1);
	return {
		text: `O carboidrato é o principal combustível do treino. Com o seu volume (cerca de ${hours} h por semana), a referência esportiva é de ${min} a ${max} g/kg (${formatNumber(weightKg * min)} a ${formatNumber(weightKg * max)} g).${
			below
				? objective === "lose"
					? " Perdendo peso, ficar abaixo é comum: se o rendimento cair, troque um pouco de gordura por carboidrato."
					: " Você está abaixo: pode faltar energia pro treino. Se o rendimento cair, aumente o carboidrato."
				: ""
		}`,
		attention: below && objective !== "lose",
	};
}

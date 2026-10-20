import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { formatNumber } from "~/shared/lib/format";

// Sódio e ferro do dia, pela TACO (e pelo sódio dos alimentos próprios,
// quando o rótulo foi copiado). Só avisos: não entram nas metas.

/** OMS: menos de 2 g de sódio por dia (≈ 5 g de sal). */
export const SODIUM_LIMIT_MG = 2000;

/** Abaixo disso o dia está quase vazio e o aviso de ferro só atrapalha. */
const MIN_IRON_CHECK_MG = 1;

const amountFor = (food: Food, quantity: number, value = 0) =>
	value * (food.unit === "unit" ? quantity : quantity / 100);

export interface DayMicronutrients {
	/** mg */
	sodium: number;
	/** mg */
	iron: number;
	/** Alimentos próprios na dieta sem sódio no cadastro (o total fica baixo). */
	customWithoutSodium: number;
}

export function dayMicronutrients(meals: DietMeal[]): DayMicronutrients {
	let sodium = 0;
	let iron = 0;
	const withoutSodium = new Set<string>();
	for (const { food, quantity } of meals.flatMap((meal) => meal.items)) {
		sodium += amountFor(food, quantity, food.sodium);
		iron += amountFor(food, quantity, food.iron);
		if (food.source === "custom" && !food.sodium) withoutSodium.add(food.id);
	}
	return { sodium, iron, customWithoutSodium: withoutSodium.size };
}

/**
 * Ferro recomendado por dia (mg), pela RDA do IOM: 8 mg pra homens e pra
 * mulheres depois dos 50; 18 mg pra mulheres de 19 a 50 (menstruação);
 * adolescentes 11 (meninos) e 15 (meninas). Null sem perfil.
 */
export function ironTarget(
	profile: Pick<BodyProfile, "sex" | "ageYears"> | null,
) {
	if (!profile) return null;
	const { sex, ageYears } = profile;
	if (ageYears < 19) return sex === "male" ? 11 : 15;
	if (sex === "female" && ageYears <= 50) return 18;
	return 8;
}

export type MicronutrientAlert = "sodium-high" | "iron-low";

export function micronutrientAlerts({
	micros,
	ironGoal,
}: {
	micros: DayMicronutrients;
	ironGoal: number | null;
}): MicronutrientAlert[] {
	const alerts: MicronutrientAlert[] = [];
	if (micros.sodium > SODIUM_LIMIT_MG) alerts.push("sodium-high");
	if (
		ironGoal !== null &&
		micros.iron >= MIN_IRON_CHECK_MG &&
		Math.round(micros.iron) < ironGoal
	) {
		alerts.push("iron-low");
	}
	return alerts;
}

/** Textos dos avisos de sódio e ferro (Resumo do dia e Início). */
export const MICRONUTRIENT_MESSAGES = {
	"sodium-high": (sodium: number) =>
		`Sódio em ${formatNumber(sodium)} mg, acima dos ${formatNumber(SODIUM_LIMIT_MG)} mg por dia que a OMS indica. Embutidos, queijos, pão e temperos prontos costumam pesar mais.`,
	"iron-low": (iron: number, goal: number) =>
		`Ferro em ${formatNumber(iron)} mg, abaixo dos ${formatNumber(goal)} mg recomendados pra você. Carne vermelha, feijão, lentilha e folhas verde-escuras ajudam.`,
} as const;

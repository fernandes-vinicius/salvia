// Limite diário de uso da IA por pessoa (por recurso): segura o custo contra
// abuso (ex.: script clicando "Outra receita" sem parar) e mede o uso real
// de cada assinante. O dia é o do fuso do app (`localDateString`).

export const AI_DAILY_LIMITS = {
	recipe: 20,
	"diet-import": 10,
	"meal-variation": 20,
} as const;

export type AiFeature = keyof typeof AI_DAILY_LIMITS;

export function limitReachedMessage(feature: AiFeature) {
	const limit = AI_DAILY_LIMITS[feature];
	const messages: Record<AiFeature, string> = {
		recipe: `Você já gerou ${limit} receitas hoje. Amanhã tem mais!`,
		"diet-import": `Você já leu ${limit} dietas hoje. Tente de novo amanhã.`,
		"meal-variation": `Você já variou refeições ${limit} vezes hoje. Amanhã tem mais!`,
	};
	return messages[feature];
}

// Uso da IA por pessoa (por recurso), em duas camadas:
// - limite diário: segura o custo contra abuso (ex.: script clicando "Outra
//   receita" sem parar); vale pra todo mundo, inclusive o beta;
// - cota mensal: a amostra grátis de cada recurso (vira no dia 1º); o beta
//   (`BETA_EMAILS`, só pra testar) não tem.
// O dia é o do fuso do app (`localDateString`).

export const AI_DAILY_LIMITS = {
	recipe: 20,
	"diet-import": 10,
	"meal-variation": 20,
	"meal-fill": 20,
	"weekly-summary": 3,
	"cheaper-swap": 60,
} as const;

export const AI_MONTHLY_LIMITS = {
	recipe: 3,
	"diet-import": 1,
	"meal-variation": 3,
	"meal-fill": 3,
	"weekly-summary": 1,
	"cheaper-swap": 5,
} as const satisfies Record<keyof typeof AI_DAILY_LIMITS, number>;

export type AiFeature = keyof typeof AI_DAILY_LIMITS;

/** Qual limite barrou o pedido. */
export type QuotaPeriod = "daily" | "monthly";

export type QuotaVerdict = "ok" | QuotaPeriod;

/** Dia 1º do mês de `day` (`AAAA-MM-DD`). */
export function monthStartOf(day: string) {
	return `${day.slice(0, 7)}-01`;
}

/** Ainda cabe mais um uso? O limite do dia vem antes da cota do mês. */
export function quotaVerdict(
	feature: AiFeature,
	usage: { today: number; month: number; unlimitedMonth: boolean },
): QuotaVerdict {
	if (usage.today >= AI_DAILY_LIMITS[feature]) return "daily";
	if (!usage.unlimitedMonth && usage.month >= AI_MONTHLY_LIMITS[feature]) {
		return "monthly";
	}
	return "ok";
}

export function limitReachedMessage(
	feature: AiFeature,
	period: QuotaPeriod = "daily",
) {
	if (period === "monthly") {
		const limit = AI_MONTHLY_LIMITS[feature];
		const monthly: Record<AiFeature, string> = {
			recipe: `Você já usou suas ${limit} receitas deste mês.`,
			"diet-import": "Você já usou a leitura de dieta deste mês.",
			"meal-variation": `Você já usou suas ${limit} variações de refeição deste mês.`,
			"meal-fill": `Você já completou refeições ${limit} vezes este mês.`,
			"weekly-summary": "Você já gerou o resumo deste mês.",
			"cheaper-swap": `Você já viu suas ${limit} sugestões de economia deste mês.`,
		};
		return `${monthly[feature]} Volta no dia 1º!`;
	}
	const limit = AI_DAILY_LIMITS[feature];
	const daily: Record<AiFeature, string> = {
		recipe: `Você já gerou ${limit} receitas hoje. Amanhã tem mais!`,
		"diet-import": `Você já leu ${limit} dietas hoje. Tente de novo amanhã.`,
		"meal-variation": `Você já variou refeições ${limit} vezes hoje. Amanhã tem mais!`,
		"meal-fill": `Você já completou refeições ${limit} vezes hoje. Amanhã tem mais!`,
		"weekly-summary":
			"Você já gerou o resumo da semana hoje. Tente de novo amanhã.",
		"cheaper-swap": `Você já viu ${limit} sugestões de economia hoje. Amanhã tem mais!`,
	};
	return daily[feature];
}

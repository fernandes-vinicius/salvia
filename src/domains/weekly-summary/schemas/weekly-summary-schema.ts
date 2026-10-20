import { z } from "zod";

// O que a IA escreve a partir dos fatos da semana (números vêm do app).
export const aiWeeklySummarySchema = z.object({
	title: z
		.string()
		.describe('Título curto e animador da semana, ex.: "Semana no ritmo".'),
	text: z
		.string()
		.describe(
			"2 ou 3 frases curtas sobre a semana, usando só os fatos recebidos.",
		),
	nextStep: z
		.string()
		.describe("Uma frase com um próximo passo simples e prático."),
});

export interface WeeklySummary {
	weekStart: string;
	title: string;
	text: string;
	nextStep: string;
}

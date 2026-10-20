import { describe, expect, it } from "vitest";

import {
	AI_DAILY_LIMITS,
	limitReachedMessage,
} from "~/domains/ai-usage/utils/ai-usage";

describe("AI_DAILY_LIMITS", () => {
	it("receitas, variações e completar 20 por dia, importação 10, resumo 3", () => {
		expect(AI_DAILY_LIMITS).toEqual({
			recipe: 20,
			"diet-import": 10,
			"meal-variation": 20,
			"meal-fill": 20,
			"weekly-summary": 3,
		});
	});
});

describe("limitReachedMessage", () => {
	it("explica o limite de cada recurso e quando volta", () => {
		expect(limitReachedMessage("recipe")).toBe(
			"Você já gerou 20 receitas hoje. Amanhã tem mais!",
		);
		expect(limitReachedMessage("diet-import")).toBe(
			"Você já leu 10 dietas hoje. Tente de novo amanhã.",
		);
		expect(limitReachedMessage("meal-variation")).toBe(
			"Você já variou refeições 20 vezes hoje. Amanhã tem mais!",
		);
	});
});

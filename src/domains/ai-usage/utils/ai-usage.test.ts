import { describe, expect, it } from "vitest";

import {
	AI_DAILY_LIMITS,
	limitReachedMessage,
} from "~/domains/ai-usage/utils/ai-usage";

describe("AI_DAILY_LIMITS", () => {
	it("receitas 20 por dia e importação 10 por dia", () => {
		expect(AI_DAILY_LIMITS).toEqual({ recipe: 20, "diet-import": 10 });
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
	});
});

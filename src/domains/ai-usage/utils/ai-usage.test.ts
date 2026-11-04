import { describe, expect, it } from "vitest";

import {
	AI_DAILY_LIMITS,
	AI_MONTHLY_LIMITS,
	limitReachedMessage,
	monthStartOf,
	quotaLeftLabel,
	quotaVerdict,
} from "~/domains/ai-usage/utils/ai-usage";

describe("AI_DAILY_LIMITS", () => {
	it("receitas, variações e completar 20 por dia, importação 10, resumo 3, troca mais em conta 60", () => {
		expect(AI_DAILY_LIMITS).toEqual({
			recipe: 20,
			"diet-import": 10,
			"meal-variation": 20,
			"meal-fill": 20,
			"weekly-summary": 3,
			"cheaper-swap": 60,
		});
	});
});

describe("AI_MONTHLY_LIMITS", () => {
	it("cota pequena do grátis: 3 receitas, variações e completar, 5 trocas, 2 importações e 4 resumos (um por semana)", () => {
		expect(AI_MONTHLY_LIMITS).toEqual({
			recipe: 3,
			"diet-import": 2,
			"meal-variation": 3,
			"meal-fill": 3,
			"weekly-summary": 4,
			"cheaper-swap": 5,
		});
	});
});

describe("monthStartOf", () => {
	it("o dia 1º do mês do dia dado", () => {
		expect(monthStartOf("2026-10-22")).toBe("2026-10-01");
		expect(monthStartOf("2026-12-31")).toBe("2026-12-01");
		expect(monthStartOf("2026-11-01")).toBe("2026-11-01");
	});
});

describe("quotaVerdict", () => {
	it("libera enquanto cabe no dia e no mês", () => {
		expect(
			quotaVerdict("recipe", { today: 0, month: 0, unlimitedMonth: false }),
		).toBe("ok");
		expect(
			quotaVerdict("recipe", { today: 2, month: 2, unlimitedMonth: false }),
		).toBe("ok");
	});

	it("barra quando a cota do mês acabou", () => {
		expect(
			quotaVerdict("recipe", { today: 0, month: 3, unlimitedMonth: false }),
		).toBe("monthly");
		expect(
			quotaVerdict("diet-import", {
				today: 0,
				month: 2,
				unlimitedMonth: false,
			}),
		).toBe("monthly");
	});

	it("o limite do dia vale mesmo sem cota do mês (beta)", () => {
		expect(
			quotaVerdict("recipe", { today: 19, month: 50, unlimitedMonth: true }),
		).toBe("ok");
		expect(
			quotaVerdict("recipe", { today: 20, month: 50, unlimitedMonth: true }),
		).toBe("daily");
	});

	it("o limite do dia vem antes do mês", () => {
		expect(
			quotaVerdict("recipe", { today: 20, month: 20, unlimitedMonth: false }),
		).toBe("daily");
	});
});

describe("limitReachedMessage", () => {
	it("explica o limite do dia de cada recurso e quando volta", () => {
		expect(limitReachedMessage("recipe")).toBe(
			"Você já gerou 20 receitas hoje. Amanhã tem mais!",
		);
		expect(limitReachedMessage("diet-import", "daily")).toBe(
			"Você já leu 10 dietas hoje. Tente de novo amanhã.",
		);
		expect(limitReachedMessage("meal-variation")).toBe(
			"Você já variou refeições 20 vezes hoje. Amanhã tem mais!",
		);
	});

	it("explica a cota do mês e que ela volta no dia 1º", () => {
		expect(limitReachedMessage("recipe", "monthly")).toBe(
			"Você já usou suas 3 receitas deste mês. Volta no dia 1º!",
		);
		expect(limitReachedMessage("diet-import", "monthly")).toBe(
			"Você já usou suas 2 leituras de dieta deste mês. Volta no dia 1º!",
		);
		expect(limitReachedMessage("weekly-summary", "monthly")).toBe(
			"Você já gerou seus 4 resumos deste mês. Volta no dia 1º!",
		);
		expect(limitReachedMessage("cheaper-swap", "monthly")).toBe(
			"Você já viu suas 5 sugestões de economia deste mês. Volta no dia 1º!",
		);
	});
});

describe("quotaLeftLabel", () => {
	it("quantos usos do mês ainda restam", () => {
		expect(quotaLeftLabel(3, 3)).toBe("Restam 3 de 3 este mês.");
		expect(quotaLeftLabel(2, 5)).toBe("Restam 2 de 5 este mês.");
		expect(quotaLeftLabel(1, 3)).toBe("Resta 1 de 3 este mês.");
		expect(quotaLeftLabel(1, 1)).toBe("Resta 1 de 1 este mês.");
	});

	it("acabou: avisa quando volta", () => {
		expect(quotaLeftLabel(0, 3)).toBe(
			"Acabou a cota deste mês. Volta no dia 1º!",
		);
	});
});

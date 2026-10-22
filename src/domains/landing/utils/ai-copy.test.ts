import { describe, expect, it } from "vitest";

import {
	aiFaqAnswer,
	aiQuotaSummary,
	aiSectionCopy,
} from "~/domains/landing/utils/ai-copy";

describe("aiQuotaSummary", () => {
	it("lista a cota grátis de cada recurso, pelos limites do mês", () => {
		expect(aiQuotaSummary()).toBe(
			"3 receitas, 3 variações de refeição, 3 vezes completar o que falta, 5 trocas mais em conta, 2 leituras de dieta e 4 resumos da semana",
		);
	});
});

describe("aiSectionCopy", () => {
	it("fechada: em breve, sem prometer data nem preço", () => {
		const copy = aiSectionCopy(false);
		expect(copy.nav).toBe("Em breve");
		expect(copy.chip).toBe("Em breve");
		expect(copy.text).toContain("Ainda não estão liberados");
	});

	it("aberta: grátis com cota mensal, e a IA pode errar", () => {
		const copy = aiSectionCopy(true);
		expect(copy.nav).toBe("IA");
		expect(copy.badge).toBe("Grátis, com cota mensal");
		expect(copy.text).toContain("3 receitas");
		expect(copy.text).toContain("volta no dia 1º");
		expect(copy.text).not.toMatch(/em breve|Pro/i);
	});
});

describe("aiFaqAnswer", () => {
	it("fechada: em teste", () => {
		expect(aiFaqAnswer(false)).toMatch(/^Vai\./);
	});

	it("aberta: já tem, com cota e conferência antes de salvar", () => {
		const answer = aiFaqAnswer(true);
		expect(answer).toMatch(/^Tem\./);
		expect(answer).toContain("2 leituras de dieta");
		expect(answer).toContain("confere");
		expect(answer).not.toMatch(/em breve|Pro/i);
	});
});

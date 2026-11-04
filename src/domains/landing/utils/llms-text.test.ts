import { describe, expect, it } from "vitest";

import { llmsText } from "~/domains/landing/utils/llms-text";

const site = new URL("https://salvia-dieta.com.br");

describe("llmsText", () => {
	it("uses the site URL in every link", () => {
		const text = llmsText(site, false);
		expect(text).toContain("(https://salvia-dieta.com.br/)");
		expect(text).toContain("(https://salvia-dieta.com.br/calculadoras/tmb)");
		expect(text).toContain("(https://salvia-dieta.com.br/login)");
		expect(text).not.toContain("vercel.app");
	});

	it("lists every public calculator", () => {
		const text = llmsText(site, false);
		for (const path of [
			"macros",
			"proteina",
			"agua",
			"imc",
			"gordura-corporal",
		]) {
			expect(text).toContain(
				`https://salvia-dieta.com.br/calculadoras/${path}`,
			);
		}
	});

	it("mentions both ways to sign in", () => {
		expect(llmsText(site, false)).toContain("Google ou com e-mail e senha");
	});

	it("says AI is coming soon while closed", () => {
		expect(llmsText(site, false)).toContain("em breve");
	});

	it("says AI is free with a monthly quota when open", () => {
		const text = llmsText(site, true);
		expect(text).toContain("grátis");
		expect(text).toContain("cota mensal");
		expect(text).not.toContain("em breve");
	});
});

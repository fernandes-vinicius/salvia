import { describe, expect, it } from "vitest";

import { authErrorMessage } from "~/domains/auth/utils/auth-errors";

describe("authErrorMessage", () => {
	it("explains a wrong email or password", () => {
		expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
			"E-mail ou senha errados.",
		);
	});

	it("asks to confirm the email when it is not verified", () => {
		expect(authErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toContain(
			"Confirme seu e-mail",
		);
	});

	it("explains a Google sign-in blocked by an unconfirmed password account", () => {
		expect(authErrorMessage({ code: "account_not_linked" })).toContain(
			"Esqueci a senha",
		);
	});

	it("treats expired and invalid links the same way", () => {
		const expired = authErrorMessage({ code: "TOKEN_EXPIRED" });
		expect(expired).toContain("link");
		expect(authErrorMessage({ code: "INVALID_TOKEN" })).toBe(expired);
	});

	it("warns about too many attempts on status 429", () => {
		expect(authErrorMessage({ status: 429 })).toContain("Muitas tentativas");
	});

	it("falls back to a generic message", () => {
		expect(authErrorMessage({ code: "SOMETHING_ELSE" })).toBe(
			"Não deu pra entrar agora. Tente de novo.",
		);
		expect(authErrorMessage({})).toBe(
			"Não deu pra entrar agora. Tente de novo.",
		);
	});
});

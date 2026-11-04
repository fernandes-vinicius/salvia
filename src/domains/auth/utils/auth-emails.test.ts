import { describe, expect, it } from "vitest";

import {
	existingAccountEmail,
	resetPasswordEmail,
	verificationEmail,
} from "~/domains/auth/utils/auth-emails";

const url = "https://salvia-dieta.com.br/api/auth/verify-email?token=abc&x=1";

describe("auth emails", () => {
	it.each([
		["verification", verificationEmail],
		["reset", resetPasswordEmail],
		["existing account", existingAccountEmail],
	])("%s email greets by first name and carries the link", (_, build) => {
		const email = build({ name: "Ana Souza", url });
		expect(email.subject).toContain("Sálvia");
		expect(email.text).toContain("Olá, Ana");
		expect(email.text).toContain(url);
		expect(email.html).toContain("Olá, Ana");
		expect(email.html).toContain(url.replace("&", "&amp;"));
		expect(email.text).toContain("ignorar");
	});

	it("escapes HTML in the name", () => {
		const email = verificationEmail({ name: "<b>Ana</b>", url });
		expect(email.html).not.toContain("<b>Ana</b>");
		expect(email.html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
	});

	it("says what each email is for", () => {
		expect(verificationEmail({ name: "Ana", url }).text).toContain(
			"Confirme seu e-mail",
		);
		expect(resetPasswordEmail({ name: "Ana", url }).text).toContain(
			"nova senha",
		);
		expect(existingAccountEmail({ name: "Ana", url }).text).toContain(
			"já tem conta",
		);
	});
});

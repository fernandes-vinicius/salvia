import { describe, expect, it } from "vitest";

import {
	forgotPasswordSchema,
	resetPasswordSchema,
	signInSchema,
	signUpSchema,
} from "~/domains/auth/schemas/credentials-schema";

describe("credentials schemas", () => {
	it("accepts a valid sign up and trims name and email", () => {
		const result = signUpSchema.parse({
			name: "  Ana  ",
			email: " ana@exemplo.com ",
			password: "12345678",
		});
		expect(result).toEqual({
			name: "Ana",
			email: "ana@exemplo.com",
			password: "12345678",
		});
	});

	it("requires a name on sign up", () => {
		expect(
			signUpSchema.safeParse({
				name: " ",
				email: "ana@exemplo.com",
				password: "12345678",
			}).success,
		).toBe(false);
	});

	it("rejects passwords shorter than 8 or longer than 128", () => {
		const base = { name: "Ana", email: "ana@exemplo.com" };
		expect(
			signUpSchema.safeParse({ ...base, password: "1234567" }).success,
		).toBe(false);
		expect(
			signUpSchema.safeParse({ ...base, password: "a".repeat(129) }).success,
		).toBe(false);
	});

	it("rejects an invalid email", () => {
		expect(
			signInSchema.safeParse({ email: "ana", password: "12345678" }).success,
		).toBe(false);
		expect(forgotPasswordSchema.safeParse({ email: "ana@" }).success).toBe(
			false,
		);
	});

	it("does not check password length on sign in", () => {
		expect(
			signInSchema.safeParse({ email: "ana@exemplo.com", password: "123" })
				.success,
		).toBe(true);
	});

	it("validates the new password on reset", () => {
		expect(resetPasswordSchema.safeParse({ password: "123" }).success).toBe(
			false,
		);
		expect(
			resetPasswordSchema.safeParse({ password: "12345678" }).success,
		).toBe(true);
	});
});

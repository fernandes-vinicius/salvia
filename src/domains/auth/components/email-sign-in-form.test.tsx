import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailSignInForm } from "~/domains/auth/components/email-sign-in-form";
import { authClient } from "~/domains/auth/lib/auth-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("~/domains/auth/lib/auth-client", () => ({
	authClient: { signIn: { email: vi.fn() } },
}));

const signIn = vi.mocked(authClient.signIn.email);

async function fill(email: string, password: string) {
	await userEvent.type(screen.getByLabelText("E-mail"), email);
	await userEvent.type(screen.getByLabelText("Senha"), password);
	await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("EmailSignInForm", () => {
	beforeEach(() => {
		signIn.mockReset();
		replace.mockReset();
	});

	it("signs in and goes to the dashboard", async () => {
		signIn.mockResolvedValue({ data: {}, error: null } as never);
		render(<EmailSignInForm />);

		await fill("ana@exemplo.com", "minhasenha");

		expect(signIn).toHaveBeenCalledWith({
			email: "ana@exemplo.com",
			password: "minhasenha",
			callbackURL: "/dashboard",
		});
		expect(replace).toHaveBeenCalledWith("/dashboard");
	});

	it("explains a wrong password", async () => {
		signIn.mockResolvedValue({
			data: null,
			error: { code: "INVALID_EMAIL_OR_PASSWORD", status: 401 },
		} as never);
		render(<EmailSignInForm />);

		await fill("ana@exemplo.com", "errada");

		expect(await screen.findByText("E-mail ou senha errados.")).toBeVisible();
		expect(replace).not.toHaveBeenCalled();
	});

	it("asks to confirm the email first", async () => {
		signIn.mockResolvedValue({
			data: null,
			error: { code: "EMAIL_NOT_VERIFIED", status: 403 },
		} as never);
		render(<EmailSignInForm />);

		await fill("ana@exemplo.com", "minhasenha");

		expect(await screen.findByText(/Confirme seu e-mail/)).toBeVisible();
	});

	it("does not call the API with an invalid email", async () => {
		render(<EmailSignInForm />);

		await fill("ana", "minhasenha");

		expect(signIn).not.toHaveBeenCalled();
	});

	it("shows and hides the password", async () => {
		render(<EmailSignInForm />);
		const input = screen.getByLabelText("Senha");
		expect(input).toHaveAttribute("type", "password");

		await userEvent.click(
			screen.getByRole("button", { name: "Mostrar senha" }),
		);
		expect(input).toHaveAttribute("type", "text");
	});
});

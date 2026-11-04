import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignUpForm } from "~/domains/auth/components/sign-up-form";
import { authClient } from "~/domains/auth/lib/auth-client";
import { analytics } from "~/shared/lib/analytics/analytics";

vi.mock("~/domains/auth/lib/auth-client", () => ({
	authClient: { signUp: { email: vi.fn() } },
}));
vi.mock("~/shared/lib/analytics/analytics", () => ({
	analytics: { track: vi.fn() },
}));

const signUp = vi.mocked(authClient.signUp.email);

async function fill() {
	await userEvent.type(screen.getByLabelText("Nome"), "Ana Souza");
	await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
	await userEvent.type(screen.getByLabelText("Senha"), "minhasenha");
	await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
}

describe("SignUpForm", () => {
	beforeEach(() => {
		signUp.mockReset();
		vi.mocked(analytics.track).mockReset();
	});

	it("creates the account and asks to check the inbox", async () => {
		signUp.mockResolvedValue({ data: {}, error: null } as never);
		render(<SignUpForm />);

		await fill();

		expect(signUp).toHaveBeenCalledWith({
			name: "Ana Souza",
			email: "ana@exemplo.com",
			password: "minhasenha",
			callbackURL: "/login?verificado=1",
		});
		expect(await screen.findByText("Confira seu e-mail")).toBeVisible();
		expect(screen.getByText("ana@exemplo.com")).toBeVisible();
		expect(analytics.track).toHaveBeenCalledWith("conta_criada", {
			metodo: "email",
		});
	});

	it("keeps the form and shows the error when it fails", async () => {
		signUp.mockResolvedValue({
			data: null,
			error: { status: 429 },
		} as never);
		render(<SignUpForm />);

		await fill();

		expect(await screen.findByText(/Muitas tentativas/)).toBeVisible();
		expect(screen.queryByText("Confira seu e-mail")).toBeNull();
	});

	it("blocks a short password", async () => {
		render(<SignUpForm />);
		await userEvent.type(screen.getByLabelText("Nome"), "Ana");
		await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
		await userEvent.type(screen.getByLabelText("Senha"), "123");
		await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

		expect(signUp).not.toHaveBeenCalled();
		expect(
			await screen.findByText("A senha precisa ter pelo menos 8 caracteres."),
		).toBeVisible();
	});
});

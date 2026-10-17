import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleSignInButton } from "~/domains/auth/components/google-sign-in-button";
import { authClient } from "~/domains/auth/lib/auth-client";

vi.mock("~/domains/auth/lib/auth-client", () => ({
	authClient: { signIn: { social: vi.fn() } },
}));

const social = vi.mocked(authClient.signIn.social);

describe("GoogleSignInButton", () => {
	beforeEach(() => {
		social.mockReset();
	});

	it("inicia o login social com o Google", async () => {
		// Promise pendente simula o redirect pro Google em andamento.
		social.mockReturnValue(new Promise(() => {}));
		render(<GoogleSignInButton />);

		const button = screen.getByRole("button", { name: "Entrar com Google" });
		await userEvent.click(button);

		expect(social).toHaveBeenCalledWith({
			provider: "google",
			callbackURL: "/",
			errorCallbackURL: "/login",
		});
		expect(button).toBeDisabled();
	});

	it("reabilita o botão quando a chamada falha", async () => {
		social.mockResolvedValue({
			data: null,
			error: { message: "falhou", status: 500, statusText: "" },
		} as never);
		render(<GoogleSignInButton />);

		const button = screen.getByRole("button", { name: "Entrar com Google" });
		await userEvent.click(button);

		expect(button).toBeEnabled();
	});
});

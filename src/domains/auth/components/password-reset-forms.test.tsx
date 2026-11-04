import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "~/domains/auth/components/forgot-password-form";
import { ResetPasswordForm } from "~/domains/auth/components/reset-password-form";
import { authClient } from "~/domains/auth/lib/auth-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("~/domains/auth/lib/auth-client", () => ({
	authClient: { requestPasswordReset: vi.fn(), resetPassword: vi.fn() },
}));

const requestReset = vi.mocked(authClient.requestPasswordReset);
const resetPassword = vi.mocked(authClient.resetPassword);

describe("ForgotPasswordForm", () => {
	beforeEach(() => requestReset.mockReset());

	it("asks for the link and always shows the same answer", async () => {
		requestReset.mockResolvedValue({ data: {}, error: null } as never);
		render(<ForgotPasswordForm />);

		await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
		await userEvent.click(screen.getByRole("button", { name: "Mandar link" }));

		expect(requestReset).toHaveBeenCalledWith({
			email: "ana@exemplo.com",
			redirectTo: "/redefinir-senha",
		});
		expect(await screen.findByText(/Se houver conta/)).toBeVisible();
	});
});

describe("ResetPasswordForm", () => {
	beforeEach(() => {
		resetPassword.mockReset();
		replace.mockReset();
	});

	it("without a token, points to a new link", () => {
		render(<ResetPasswordForm token={null} />);

		expect(screen.queryByLabelText("Nova senha")).toBeNull();
		expect(screen.getByText("Pedir um link novo").closest("a")).toHaveAttribute(
			"href",
			"/esqueci-a-senha",
		);
	});

	it("saves the new password and goes to the login", async () => {
		resetPassword.mockResolvedValue({ data: {}, error: null } as never);
		render(<ResetPasswordForm token="abc" />);

		await userEvent.type(screen.getByLabelText("Nova senha"), "novasenha1");
		await userEvent.click(
			screen.getByRole("button", { name: "Salvar nova senha" }),
		);

		expect(resetPassword).toHaveBeenCalledWith({
			newPassword: "novasenha1",
			token: "abc",
		});
		expect(replace).toHaveBeenCalledWith("/login");
	});

	it("explains an expired link", async () => {
		resetPassword.mockResolvedValue({
			data: null,
			error: { code: "INVALID_TOKEN", status: 400 },
		} as never);
		render(<ResetPasswordForm token="abc" />);

		await userEvent.type(screen.getByLabelText("Nova senha"), "novasenha1");
		await userEvent.click(
			screen.getByRole("button", { name: "Salvar nova senha" }),
		);

		expect(await screen.findByText(/link venceu/)).toBeVisible();
		expect(replace).not.toHaveBeenCalled();
	});
});

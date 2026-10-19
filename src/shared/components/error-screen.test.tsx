import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorScreen } from "~/shared/components/error-screen";

describe("ErrorScreen", () => {
	it("explica o erro sem mostrar a mensagem técnica", () => {
		render(
			<ErrorScreen
				error={new Error("connect ECONNREFUSED 10.0.0.1")}
				retry={() => {}}
				homeHref="/dashboard"
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Algo deu errado" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/ECONNREFUSED/)).not.toBeInTheDocument();
	});

	it("tenta de novo ao tocar no botão", async () => {
		const retry = vi.fn();
		render(<ErrorScreen error={new Error("x")} retry={retry} homeHref="/" />);
		await userEvent.click(
			screen.getByRole("button", { name: "Tentar de novo" }),
		);
		expect(retry).toHaveBeenCalledOnce();
	});

	it("mostra o código do erro do servidor pra quem for avisar", () => {
		const error = Object.assign(new Error("x"), { digest: "abc123" });
		render(<ErrorScreen error={error} retry={() => {}} homeHref="/" />);
		expect(screen.getByText("Código: abc123")).toBeInTheDocument();
	});

	it("aceita erro que não é Error (lançado no client)", () => {
		render(<ErrorScreen error="falhou" retry={() => {}} homeHref="/" />);
		expect(screen.queryByText(/Código:/)).not.toBeInTheDocument();
	});

	it("leva pro início indicado", () => {
		render(<ErrorScreen error={null} retry={() => {}} homeHref="/dashboard" />);
		// Button do Base UI como link: é um <a> com role="button".
		expect(screen.getByText("Voltar pro início").closest("a")).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});

	it("fora da área logada não fala do menu do perfil", () => {
		render(
			<ErrorScreen
				error={null}
				retry={() => {}}
				homeHref="/"
				signedIn={false}
			/>,
		);
		expect(screen.queryByText(/menu do perfil/)).not.toBeInTheDocument();
		expect(screen.getByText(/tente mais tarde/)).toBeInTheDocument();
	});
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerAiInterestAction } from "~/domains/ai-usage/actions/ai-interest-actions";
import {
	AiQuotaNote,
	AiQuotaProvider,
} from "~/domains/ai-usage/components/ai-quota-provider";
import { analytics } from "~/shared/lib/analytics/analytics";

vi.mock("next/navigation", () => ({ usePathname: () => "/dieta" }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Server Action não roda no teste do componente.
vi.mock("~/domains/ai-usage/actions/ai-interest-actions", () => ({
	registerAiInterestAction: vi.fn(),
}));
vi.mock("~/shared/lib/analytics/analytics", () => ({
	analytics: { track: vi.fn() },
}));

const register = vi.mocked(registerAiInterestAction);

describe("AiQuotaNote", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("com cota sobrando, mostra quanto resta e não oferece mais", () => {
		render(
			<AiQuotaProvider initial={{ recipe: 2 }}>
				<AiQuotaNote feature="recipe" />
			</AiQuotaProvider>,
		);
		expect(screen.getByText("Restam 2 de 3 este mês.")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Quero usar mais" }),
		).not.toBeInTheDocument();
	});

	it("com a cota no fim, pede mais e agradece", async () => {
		register.mockResolvedValue({ ok: true });
		render(
			<AiQuotaProvider initial={{ recipe: 0 }}>
				<AiQuotaNote feature="recipe" />
			</AiQuotaProvider>,
		);
		await userEvent.click(
			screen.getByRole("button", { name: "Quero usar mais" }),
		);
		expect(register).toHaveBeenCalledWith("recipe");
		expect(await screen.findByText(/Anotado!/)).toBeInTheDocument();
		expect(analytics.track).toHaveBeenCalledWith("quero_mais_ia", {
			recurso: "recipe",
			pagina: "/dieta",
		});
	});

	it("quem já pediu vê o agradecimento sem o botão", () => {
		render(
			<AiQuotaProvider initial={{ recipe: 0 }} interested={["recipe"]}>
				<AiQuotaNote feature="recipe" />
			</AiQuotaProvider>,
		);
		expect(screen.getByText(/Anotado!/)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Quero usar mais" }),
		).not.toBeInTheDocument();
	});

	it("se falhar, o botão continua", async () => {
		register.mockResolvedValue({ ok: false, error: "Erro" });
		render(
			<AiQuotaProvider initial={{ recipe: 0 }}>
				<AiQuotaNote feature="recipe" />
			</AiQuotaProvider>,
		);
		await userEvent.click(
			screen.getByRole("button", { name: "Quero usar mais" }),
		);
		expect(
			screen.getByRole("button", { name: "Quero usar mais" }),
		).toBeInTheDocument();
		expect(analytics.track).not.toHaveBeenCalled();
	});

	it("sem cota (beta ou sem provider), não mostra nada", () => {
		const { container } = render(<AiQuotaNote feature="recipe" />);
		expect(container).toBeEmptyDOMElement();
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeedbackSheet } from "~/domains/feedback/components/feedback-sheet";

vi.mock("next/navigation", () => ({ usePathname: () => "/dieta" }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Server Action não roda no teste do componente.
vi.mock("~/domains/feedback/actions/feedback-actions", () => ({
	sendFeedbackAction: vi.fn(),
}));

describe("FeedbackSheet", () => {
	it("empilha os tipos no celular e só põe lado a lado em telas maiores (mobile first)", () => {
		render(<FeedbackSheet open onOpenChange={() => {}} />);
		const group = screen.getByRole("radiogroup", { name: "Tipo de mensagem" });
		const classes = group.className.split(/\s+/);
		expect(classes).toContain("grid-cols-1");
		expect(classes).toContain("sm:grid-cols-3");
		expect(classes).not.toContain("grid-cols-3");
	});

	it("mostra os três tipos com o nome inteiro", () => {
		render(<FeedbackSheet open onOpenChange={() => {}} />);
		for (const name of [
			"Ideia de recurso",
			"Algo não funciona",
			"Elogio ou outro",
		]) {
			expect(
				screen.getByRole("radio", { name: new RegExp(name) }),
			).toBeInTheDocument();
		}
	});
});

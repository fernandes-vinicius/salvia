import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DietSummaryCompact } from "~/domains/diet/components/diet-summary-compact";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import type { GoalTargets } from "~/domains/goal/types/goal-types";

const summary = summarizeDiet([], { weightKg: 75, tdee: 2400 });
const targets = {
	calories: 2000,
	protein: { grams: 150, kcal: 600, perKg: 2 },
	carbs: { grams: 200, kcal: 800, perKg: 2.7 },
	fat: { grams: 60, kcal: 540, perKg: 0.8 },
} as GoalTargets;

describe("DietSummaryCompact", () => {
	it("mostra kcal e macros com a meta numa linha", () => {
		render(
			<DietSummaryCompact
				summary={summary}
				targets={targets}
				proteinCounting="total"
				expanded={false}
				onToggle={() => {}}
			/>,
		);
		expect(screen.getByText("/ 2.000")).toBeInTheDocument();
		expect(screen.getByText("/ 150 g")).toBeInTheDocument();
	});

	it("abre e fecha o resumo completo", async () => {
		const onToggle = vi.fn();
		render(
			<DietSummaryCompact
				summary={summary}
				targets={null}
				proteinCounting="total"
				expanded={false}
				onToggle={onToggle}
			/>,
		);
		const button = screen.getByRole("button", { name: /ver resumo completo/i });
		expect(button).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(button);
		expect(onToggle).toHaveBeenCalled();
	});
});

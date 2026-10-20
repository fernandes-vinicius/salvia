import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import { summarizeDiet } from "~/domains/diet/utils/diet";

const summary = summarizeDiet([], { weightKg: 75, tdee: 2400 });

describe("DietSummaryCard · água", () => {
	it("mostra a água sugerida na última linha, depois de sódio e ferro", () => {
		render(
			<DietSummaryCard
				summary={summary}
				tdee={2400}
				water={{ minimumMl: 2600, recommendedMl: 3400, trainingMl: 400 }}
				micros={{
					values: { sodium: 900, iron: 9, customWithoutSodium: 0 },
					ironGoal: 8,
				}}
			/>,
		);
		const rows = screen.getAllByRole("row");
		const names = rows.map(
			(row) => within(row).queryByRole("rowheader")?.textContent,
		);
		expect(names.indexOf("Água")).toBe(names.length - 1);
		expect(names.indexOf("Ferro")).toBe(names.indexOf("Sódio") + 1);

		const water = rows[names.indexOf("Água")];
		expect(water).toHaveTextContent("3,4");
		expect(water).toHaveTextContent("L");
		expect(water).toHaveTextContent("mínimo 2,6 L");
	});

	it("não mostra a água sem dados do perfil", () => {
		render(<DietSummaryCard summary={summary} tdee={null} />);
		expect(
			screen.queryByRole("rowheader", { name: "Água" }),
		).not.toBeInTheDocument();
	});
});

describe("DietSummaryCard · totais", () => {
	it("não mostra custo do dia (o custo fica na lista de compras)", () => {
		render(<DietSummaryCard summary={summary} tdee={2400} />);
		expect(screen.queryByText("Custo do dia")).not.toBeInTheDocument();
		expect(screen.getByText("Total planejado")).toBeInTheDocument();
	});
});

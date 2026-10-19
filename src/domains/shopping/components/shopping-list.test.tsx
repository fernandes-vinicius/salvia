import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { ShoppingList } from "~/domains/shopping/components/shopping-list";
import type { Price } from "~/domains/shopping/data/reference-prices";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Server Actions não rodam no teste do componente.
vi.mock("~/domains/shopping/actions/price-actions", () => ({
	setUserPriceAction: vi.fn(),
	resetUserPriceAction: vi.fn(),
}));

const meals: DietMeal[] = [
	{
		id: "m1",
		name: "Café da manhã",
		time: "07:00",
		items: [
			{
				id: "i1",
				quantity: 100,
				food: {
					id: "ovo",
					source: "taco",
					name: "Ovo, de galinha, inteiro, cru",
					category: "Ovos e derivados",
					unit: "g",
					protein: 13,
					carbs: 1.6,
					fat: 8.9,
					fiber: 0,
					proteinSource: "animal",
				},
				options: [],
			},
		],
	},
];

function renderList(searchParams = "", prices: [string, Price][] = []) {
	return render(
		<NuqsTestingAdapter searchParams={searchParams}>
			<ShoppingList meals={meals} initialPrices={prices} />
		</NuqsTestingAdapter>,
	);
}

describe("ShoppingList", () => {
	beforeEach(() => localStorage.clear());

	it("mostra 1 semana por padrão e muda com o período", async () => {
		renderList();
		const eggs = screen.getByRole("region", { name: "Laticínios e ovos" });
		expect(within(eggs).getByText("14 ovos")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "1 dia" }));
		expect(within(eggs).getByText("2 ovos")).toBeInTheDocument();
	});

	it("marca o que já pegou e lembra ao voltar", async () => {
		const { unmount } = renderList();
		await userEvent.click(screen.getByRole("checkbox"));
		expect(screen.getByRole("checkbox")).toBeChecked();
		unmount();

		renderList();
		expect(screen.getByRole("checkbox")).toBeChecked();
		expect(
			screen.getByRole("button", { name: /Desmarcar tudo/ }),
		).toBeInTheDocument();
	});

	it("mostra o custo com o preço de referência", () => {
		renderList();
		// 14 ovos na semana × R$ 10 a dúzia.
		const cost = screen.getByRole("region", { name: /Custo estimado/ });
		expect(within(cost).getByText(/R\$\s?11,67/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Editar o preço de Ovos" }),
		).toHaveTextContent("R$ 10,00/dz");
	});

	it("usa o preço que a pessoa salvou no lugar da referência", () => {
		renderList("", [["ovos", { value: 12, per: "dz" }]]);
		const cost = screen.getByRole("region", { name: /Custo estimado/ });
		expect(within(cost).getByText(/R\$\s?14,00/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Editar o preço de Ovos" }),
		).toHaveTextContent("seu preço");
	});
});

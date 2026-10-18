import { describe, expect, it } from "vitest";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import type { Food } from "~/domains/food/types/food-types";
import {
	buildShoppingList,
	formatAmount,
	shoppingListText,
} from "~/domains/shopping/utils/shopping-list";

function taco(name: string, category: string): Food {
	return {
		id: name,
		source: "taco",
		name,
		category,
		unit: "g",
		protein: 10,
		carbs: 10,
		fat: 1,
		fiber: 0,
		proteinSource: "animal",
	};
}

const arroz = taco("Arroz, tipo 1, cozido", "Cereais e derivados");
const frangoCozido = taco(
	"Frango, peito, sem pele, cozido",
	"Carnes e derivados",
);
const frangoGrelhado = taco(
	"Frango, peito, sem pele, grelhado",
	"Carnes e derivados",
);
const ovo = taco("Ovo, de galinha, inteiro, cru", "Ovos e derivados");
const alface = taco("Alface, crespa, crua", "Verduras, hortaliças e derivados");
const whey: Food = {
	...taco("Whey protein", ""),
	id: "whey",
	source: "custom",
	category: null,
};

function meal(items: [Food, number][]): DietMeal {
	return {
		id: Math.random().toString(),
		name: "Refeição",
		time: null,
		items: items.map(([food, quantity], i) => ({
			id: String(i),
			food,
			quantity,
			options: [],
		})),
	};
}

describe("buildShoppingList", () => {
	const meals = [
		meal([
			[ovo, 200],
			[arroz, 100],
			[frangoCozido, 100],
		]),
		meal([
			[arroz, 100],
			[frangoGrelhado, 100],
			[alface, 60],
			[whey, 30],
		]),
	];
	const groups = buildShoppingList(meals, 7);
	const find = (name: string) =>
		groups.flatMap((g) => g.items).find((item) => item.name === name);

	it("agrupa por seção, na ordem do mercado", () => {
		expect(groups.map((g) => g.section)).toEqual([
			"Hortifrúti",
			"Açougue e peixaria",
			"Laticínios e ovos",
			"Mercearia",
			"Outros",
		]);
	});

	it("converte o que está pronto na dieta pro peso cru", () => {
		// 200 g cozido × 7 dias = 1,4 kg pronto → × 0,36 ≈ 504 g cru.
		expect(find("Arroz")).toMatchObject({
			amount: "550 g",
			detail: "peso cru · rende ≈ 1,4 kg pronto",
		});
	});

	it("junta preparos diferentes do mesmo item", () => {
		// (100 cozido + 100 grelhado) × 7 × 1,4 = 1.960 g.
		expect(find("Peito de frango sem pele")?.amount).toBe("2 kg");
	});

	it("conta ovos em unidades e dúzias", () => {
		// 200 g × 7 = 1.400 g ÷ 50 g = 28 ovos.
		expect(find("Ovos")).toMatchObject({
			amount: "28 ovos",
			detail: "≈ 2,5 dúzias · ≈ 1,4 kg",
		});
	});

	it("usa nome de mercado e mantém alimentos sem regra", () => {
		expect(find("Alface crespa")?.amount).toBe("450 g");
		expect(find("Whey protein")?.amount).toBe("250 g");
	});

	it("gera o texto pra compartilhar", () => {
		const text = shoppingListText(groups, 7);
		expect(text).toContain("*Lista de compras · 7 dias*");
		expect(text).toContain("*Laticínios e ovos*\n- Ovos: 28 ovos");
	});
});

describe("formatAmount", () => {
	it("arredonda pra cima em passos de mercado", () => {
		expect(formatAmount(42, "g")).toBe("50 g");
		expect(formatAmount(504, "g")).toBe("550 g");
		expect(formatAmount(1960, "g")).toBe("2 kg");
		expect(formatAmount(1250, "ml")).toBe("1,3 L");
	});
});

describe("buildShoppingList — cru e pronto juntos", () => {
	it("soma arroz cru com arroz cozido sem prometer rendimento", () => {
		const arrozCru = taco("Arroz, tipo 1, cru", "Cereais e derivados");
		const [group] = buildShoppingList(
			[
				meal([
					[arroz, 100],
					[arrozCru, 50],
				]),
			],
			1,
		);
		// 100 × 0,36 + 50 = 86 g.
		expect(group.items[0]).toMatchObject({
			name: "Arroz",
			amount: "90 g",
			detail: "peso cru",
		});
	});
});

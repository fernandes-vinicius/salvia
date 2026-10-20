import { describe, expect, it } from "vitest";

import {
	countedProtein,
	DEFAULT_PROTEIN_COUNTING,
	PROTEIN_LABELS,
} from "~/domains/goal/utils/protein-counting";

const macros = { proteinAnimal: 30, proteinVegetal: 12, carbs: 50, fat: 10 };

describe("countedProtein", () => {
	it("total soma animal e vegetal", () => {
		expect(countedProtein(macros, "total")).toBe(42);
	});

	it("só animal ignora a vegetal", () => {
		expect(countedProtein(macros, "animal")).toBe(30);
	});
});

describe("PROTEIN_LABELS", () => {
	it("coluna P no total e P(A) no animal", () => {
		expect(PROTEIN_LABELS.total.column).toBe("P");
		expect(PROTEIN_LABELS.animal.column).toBe("P(A)");
		expect(PROTEIN_LABELS.total.title).toBe("Proteína");
		expect(PROTEIN_LABELS.animal.title).toBe("Proteína animal");
	});

	it("padrão é o total", () => {
		expect(DEFAULT_PROTEIN_COUNTING).toBe("total");
	});
});

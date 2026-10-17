import { describe, expect, it } from "vitest";

import { goalSchema } from "~/domains/goal/schemas/goal-schema";

const base = { proteinPerKg: 2.2, fatPerKg: 0.9, carbsPerKg: null };

describe("goalSchema", () => {
	it("aceita déficit personalizado ao perder peso", () => {
		expect(
			goalSchema.safeParse({
				...base,
				objective: "lose",
				calorieAdjustment: -471,
			}).success,
		).toBe(true);
	});

	it("aceita carboidrato manual em g/kg", () => {
		expect(
			goalSchema.safeParse({
				...base,
				carbsPerKg: 2,
				objective: "maintain",
				calorieAdjustment: 0,
			}).success,
		).toBe(true);
	});

	it("recusa ajuste com sinal errado pro objetivo", () => {
		expect(
			goalSchema.safeParse({
				...base,
				objective: "gain",
				calorieAdjustment: -250,
			}).success,
		).toBe(false);
		expect(
			goalSchema.safeParse({
				...base,
				objective: "maintain",
				calorieAdjustment: 100,
			}).success,
		).toBe(false);
	});
});

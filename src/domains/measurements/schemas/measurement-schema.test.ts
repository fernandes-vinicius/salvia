import { describe, expect, it } from "vitest";

import { measurementSchema } from "~/domains/measurements/schemas/measurement-schema";

describe("measurementSchema", () => {
	it("campos ausentes viram null (pra limpar na edição)", () => {
		const parsed = measurementSchema.parse({
			measuredOn: "2026-09-01",
			weightKg: 69,
		});
		expect(parsed.weightKg).toBe(69);
		expect(parsed.waistCm).toBeNull();
	});

	it("exige pelo menos uma medida", () => {
		expect(
			measurementSchema.safeParse({ measuredOn: "2026-09-01" }).success,
		).toBe(false);
	});

	it("recusa valores fora da faixa", () => {
		expect(
			measurementSchema.safeParse({ measuredOn: "2026-09-01", waistCm: 5 })
				.success,
		).toBe(false);
	});
});

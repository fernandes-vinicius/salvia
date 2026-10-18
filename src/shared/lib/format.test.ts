import { describe, expect, it } from "vitest";

import { formatNonZero } from "~/shared/lib/format";

describe("formatNonZero", () => {
	it("esconde valores que arredondam pra zero", () => {
		expect(formatNonZero(0)).toBe("");
		expect(formatNonZero(0.4)).toBe("");
		expect(formatNonZero(-0.2)).toBe("");
	});

	it("mostra os demais valores formatados", () => {
		expect(formatNonZero(0.6)).toBe("1");
		expect(formatNonZero(1234)).toBe("1.234");
		expect(formatNonZero(0.04, 1)).toBe("");
		expect(formatNonZero(0.25, 1)).toBe("0,3");
	});
});

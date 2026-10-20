import { describe, expect, it } from "vitest";

import { clarityProjectId } from "~/shared/lib/analytics/clarity";

describe("clarityProjectId", () => {
	it("aceita o id do projeto (letras e números)", () => {
		expect(clarityProjectId(" abc123xyz0 ")).toBe("abc123xyz0");
	});

	it("recusa vazio ou qualquer coisa que não seja um id", () => {
		expect(clarityProjectId(undefined)).toBeNull();
		expect(clarityProjectId("")).toBeNull();
		expect(clarityProjectId('abc");alert(1)//')).toBeNull();
	});
});

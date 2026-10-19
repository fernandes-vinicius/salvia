import { describe, expect, it } from "vitest";

import { isBetaEmail } from "~/shared/lib/beta";

describe("isBetaEmail", () => {
	it("libera e-mail da lista, sem diferenciar maiúsculas", () => {
		expect(isBetaEmail("Eu@Exemplo.com", "eu@exemplo.com")).toBe(true);
	});

	it("aceita lista separada por vírgula, espaço ou quebra de linha", () => {
		const list = " a@x.com, b@x.com\nc@x.com  d@x.com ";
		expect(isBetaEmail("b@x.com", list)).toBe(true);
		expect(isBetaEmail("c@x.com", list)).toBe(true);
		expect(isBetaEmail("d@x.com", list)).toBe(true);
	});

	it("recusa quem não está na lista", () => {
		expect(isBetaEmail("outro@x.com", "a@x.com,b@x.com")).toBe(false);
	});

	it("lista vazia ou ausente não libera ninguém", () => {
		expect(isBetaEmail("a@x.com", "")).toBe(false);
		expect(isBetaEmail("a@x.com", undefined)).toBe(false);
		expect(isBetaEmail("", " , ")).toBe(false);
	});
});

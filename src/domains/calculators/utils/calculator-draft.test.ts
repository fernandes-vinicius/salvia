import { beforeEach, describe, expect, it } from "vitest";

import {
	readCalculatorDraft,
	saveCalculatorDraft,
	takeCalculatorDraft,
} from "~/domains/calculators/utils/calculator-draft";
import { defaultGoalFor } from "~/domains/goal/utils/goal";
import { EXAMPLE_PROFILE } from "~/domains/profile/utils/energy";

describe("calculator draft", () => {
	beforeEach(() => localStorage.clear());

	it("junta as partes salvas em momentos diferentes", () => {
		saveCalculatorDraft({ profile: EXAMPLE_PROFILE });
		saveCalculatorDraft({ goal: defaultGoalFor("lose") });

		expect(readCalculatorDraft()).toEqual({
			profile: EXAMPLE_PROFILE,
			goal: defaultGoalFor("lose"),
		});
	});

	it("entrega a parte pedida uma vez só e mantém o resto", () => {
		saveCalculatorDraft({
			profile: EXAMPLE_PROFILE,
			goal: defaultGoalFor("gain"),
		});

		expect(takeCalculatorDraft("profile")).toEqual(EXAMPLE_PROFILE);
		expect(takeCalculatorDraft("profile")).toBeUndefined();
		expect(readCalculatorDraft()).toEqual({ goal: defaultGoalFor("gain") });

		takeCalculatorDraft("goal");
		expect(localStorage.length).toBe(0);
	});

	it("ignora conteúdo corrompido", () => {
		localStorage.setItem("salvia:calculadora", "{não é json");
		expect(readCalculatorDraft()).toEqual({});
	});
});

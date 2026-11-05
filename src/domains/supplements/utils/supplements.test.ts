import { describe, expect, it } from "vitest";

import type { Supplement } from "~/domains/supplements/types/supplement-types";
import {
	daysLabel,
	doseLabel,
	looksCaloric,
	mealSupplements,
	moveSupplement,
	supplementsForDay,
	timingLabel,
} from "~/domains/supplements/utils/supplements";

function supplement(overrides: Partial<Supplement> = {}): Supplement {
	return {
		id: "s1",
		name: "Creatina",
		dose: 5,
		unit: "g",
		timing: "meal",
		mealId: "m1",
		time: null,
		days: "every_day",
		weekdays: [],
		note: null,
		...overrides,
	};
}

const meals = [
	{ id: "m1", name: "Café da manhã", time: "07:00" },
	{ id: "m2", name: "Almoço", time: null },
];

describe("doseLabel", () => {
	it("mostra o número no formato brasileiro com a unidade", () => {
		expect(doseLabel(5, "g")).toBe("5 g");
		expect(doseLabel(2.5, "g")).toBe("2,5 g");
		expect(doseLabel(200, "mg")).toBe("200 mg");
		expect(doseLabel(2000, "iu")).toBe("2.000 UI");
	});

	it("põe no plural as unidades contáveis", () => {
		expect(doseLabel(1, "capsule")).toBe("1 cápsula");
		expect(doseLabel(2, "capsule")).toBe("2 cápsulas");
		expect(doseLabel(1, "scoop")).toBe("1 dose");
		expect(doseLabel(10, "drop")).toBe("10 gotas");
		expect(doseLabel(0.5, "tablet")).toBe("0,5 comprimido");
	});
});

describe("timingLabel", () => {
	it("usa o nome e o horário da refeição", () => {
		expect(timingLabel(supplement(), meals)).toBe("Café da manhã · 07:00");
		expect(timingLabel(supplement({ mealId: "m2" }), meals)).toBe("Almoço");
	});

	it("sem a refeição (apagada), fica genérico", () => {
		expect(timingLabel(supplement({ mealId: null }), meals)).toBe(
			"Junto de uma refeição",
		);
		expect(timingLabel(supplement({ mealId: "sumiu" }), meals)).toBe(
			"Junto de uma refeição",
		);
	});

	it("descreve os outros momentos", () => {
		expect(timingLabel(supplement({ timing: "before_workout" }), meals)).toBe(
			"Antes do treino",
		);
		expect(timingLabel(supplement({ timing: "after_workout" }), meals)).toBe(
			"Depois do treino",
		);
		expect(timingLabel(supplement({ timing: "wake_up" }), meals)).toBe(
			"Ao acordar",
		);
		expect(timingLabel(supplement({ timing: "bedtime" }), meals)).toBe(
			"Antes de dormir",
		);
		expect(
			timingLabel(supplement({ timing: "time", time: "08:30" }), meals),
		).toBe("Às 08:30");
	});
});

describe("daysLabel", () => {
	it("descreve todo dia e dias de treino", () => {
		expect(daysLabel("every_day", [])).toBe("Todo dia");
		expect(daysLabel("training_days", [])).toBe("Dias de treino");
	});

	it("lista os dias escolhidos na ordem da semana, começando na segunda", () => {
		expect(daysLabel("weekdays", [5, 1, 3])).toBe("Seg, Qua e Sex");
		expect(daysLabel("weekdays", [0, 6])).toBe("Sáb e Dom");
		expect(daysLabel("weekdays", [2])).toBe("Ter");
	});

	it("a semana inteira vira todo dia", () => {
		expect(daysLabel("weekdays", [0, 1, 2, 3, 4, 5, 6])).toBe("Todo dia");
	});
});

describe("looksCaloric", () => {
	it("reconhece suplementos que têm calorias", () => {
		expect(looksCaloric("Whey protein")).toBe(true);
		expect(looksCaloric("ALBUMINA")).toBe(true);
		expect(looksCaloric("Hipercalórico")).toBe(true);
		expect(looksCaloric("Caseína")).toBe(true);
		expect(looksCaloric("Maltodextrina")).toBe(true);
		expect(looksCaloric("Barrinha de proteína")).toBe(true);
	});

	it("não marca os sem calorias relevantes", () => {
		expect(looksCaloric("Creatina")).toBe(false);
		expect(looksCaloric("Ômega 3")).toBe(false);
		expect(looksCaloric("Multivitamínico")).toBe(false);
		expect(looksCaloric("Cafeína")).toBe(false);
	});
});

describe("moveSupplement", () => {
	const list = [
		supplement({ id: "a" }),
		supplement({ id: "b" }),
		supplement({ id: "c" }),
	];
	const ids = (items: Supplement[]) => items.map((item) => item.id);

	it("sobe e desce uma posição", () => {
		expect(ids(moveSupplement(list, "b", -1))).toEqual(["b", "a", "c"]);
		expect(ids(moveSupplement(list, "b", 1))).toEqual(["a", "c", "b"]);
	});

	it("não passa das pontas", () => {
		expect(ids(moveSupplement(list, "a", -1))).toEqual(["a", "b", "c"]);
		expect(ids(moveSupplement(list, "c", 1))).toEqual(["a", "b", "c"]);
	});
});

describe("supplementsForDay", () => {
	const ids = (items: Supplement[]) => items.map((item) => item.id);
	const list = [
		supplement({ id: "todo-dia" }),
		supplement({ id: "treino", days: "training_days" }),
		supplement({ id: "seg-qua", days: "weekdays", weekdays: [1, 3] }),
		supplement({ id: "domingo", days: "weekdays", weekdays: [0] }),
	];

	it("numa segunda, mostra os de todo dia, os de treino e os de segunda", () => {
		// 02/11/2026 é segunda-feira.
		expect(ids(supplementsForDay(list, "2026-11-02"))).toEqual([
			"todo-dia",
			"treino",
			"seg-qua",
		]);
	});

	it("no domingo, só o do domingo entre os de dias escolhidos", () => {
		expect(ids(supplementsForDay(list, "2026-11-08"))).toEqual([
			"todo-dia",
			"treino",
			"domingo",
		]);
	});
});

describe("mealSupplements", () => {
	it("traz os ligados à refeição que valem no dia", () => {
		const list = [
			supplement({ id: "a", mealId: "m1" }),
			supplement({ id: "b", mealId: "m2" }),
			supplement({ id: "c", timing: "bedtime", mealId: null }),
			supplement({ id: "d", mealId: "m1", days: "weekdays", weekdays: [5] }),
		];
		// Segunda: o "d" (só sexta) fica de fora.
		expect(
			mealSupplements(list, "m1", "2026-11-02").map((item) => item.id),
		).toEqual(["a"]);
	});
});

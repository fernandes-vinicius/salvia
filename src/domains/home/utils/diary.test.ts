import { describe, expect, it } from "vitest";

import type { Checkin } from "~/domains/checkin/types/checkin-types";
import {
	DIARY_DAYS_BACK,
	diaryDay,
	diaryDayKind,
	diaryDayLabel,
	diaryDayPhrase,
	diaryLongDate,
	earliestDiaryDay,
	isDiaryDay,
	monthGrid,
	shiftMonth,
	weekdayLetter,
	weekOf,
} from "~/domains/home/utils/diary";

const TODAY = "2026-11-18"; // quarta-feira

describe("isDiaryDay", () => {
	it("aceita hoje e dias passados dentro da janela", () => {
		expect(isDiaryDay(TODAY, TODAY)).toBe(true);
		expect(isDiaryDay("2026-11-17", TODAY)).toBe(true);
		expect(isDiaryDay(earliestDiaryDay(TODAY), TODAY)).toBe(true);
	});

	it("recusa futuro, antes da janela e datas inválidas", () => {
		expect(isDiaryDay("2026-11-19", TODAY)).toBe(false);
		expect(isDiaryDay("2025-11-17", TODAY)).toBe(false);
		expect(isDiaryDay("2026-02-30", TODAY)).toBe(false);
		expect(isDiaryDay("18/11/2026", TODAY)).toBe(false);
		expect(isDiaryDay(null, TODAY)).toBe(false);
		expect(isDiaryDay(20261118, TODAY)).toBe(false);
	});

	it("a janela vai até um ano pra trás", () => {
		expect(DIARY_DAYS_BACK).toBe(365);
		expect(earliestDiaryDay(TODAY)).toBe("2025-11-18");
	});
});

describe("diaryDay", () => {
	it("usa o dia da URL quando vale", () => {
		expect(diaryDay("2026-11-10", TODAY)).toBe("2026-11-10");
	});

	it("cai em hoje sem dia ou com dia que não vale", () => {
		expect(diaryDay(undefined, TODAY)).toBe(TODAY);
		expect(diaryDay(null, TODAY)).toBe(TODAY);
		expect(diaryDay("2026-12-01", TODAY)).toBe(TODAY);
		expect(diaryDay("ontem", TODAY)).toBe(TODAY);
	});
});

describe("diaryDayLabel", () => {
	it("hoje e ontem pelo nome, com a data embaixo", () => {
		expect(diaryDayLabel(TODAY, TODAY)).toEqual({
			title: "Hoje",
			subtitle: "qua, 18 de novembro",
		});
		expect(diaryDayLabel("2026-11-17", TODAY)).toEqual({
			title: "Ontem",
			subtitle: "ter, 17 de novembro",
		});
	});

	it("outros dias pelo dia da semana", () => {
		expect(diaryDayLabel("2026-11-16", TODAY)).toEqual({
			title: "Segunda-feira",
			subtitle: "16 de novembro",
		});
	});

	it("mostra o ano quando não é o de hoje", () => {
		expect(diaryDayLabel("2025-12-31", TODAY).subtitle).toBe(
			"31 de dezembro de 2025",
		);
	});
});

describe("diaryDayPhrase", () => {
	it("frase curta pra usar no meio do texto", () => {
		expect(diaryDayPhrase(TODAY, TODAY)).toBe("hoje");
		expect(diaryDayPhrase("2026-11-17", TODAY)).toBe("ontem, 17 de nov.");
		expect(diaryDayPhrase("2026-11-16", TODAY)).toBe("segunda, 16 de nov.");
		expect(diaryDayPhrase("2025-12-31", TODAY)).toBe(
			"quarta, 31 de dez. de 2025",
		);
	});
});

describe("weekOf", () => {
	it("a semana de domingo a sábado que contém o dia", () => {
		expect(weekOf(TODAY)).toEqual([
			"2026-11-15",
			"2026-11-16",
			"2026-11-17",
			"2026-11-18",
			"2026-11-19",
			"2026-11-20",
			"2026-11-21",
		]);
		expect(weekOf("2026-11-15")[0]).toBe("2026-11-15");
		expect(weekOf("2026-11-21")[6]).toBe("2026-11-21");
	});
});

describe("monthGrid", () => {
	it("começa no domingo com espaços vazios antes do dia 1", () => {
		// 1º de novembro de 2026 é domingo; 1º de dezembro, terça.
		const november = monthGrid("2026-11");
		expect(november[0]).toBe("2026-11-01");
		expect(november).toHaveLength(30);

		const december = monthGrid("2026-12");
		expect(december.slice(0, 3)).toEqual([null, null, "2026-12-01"]);
		expect(december.at(-1)).toBe("2026-12-31");
	});

	it("fevereiro de ano bissexto", () => {
		expect(monthGrid("2028-02").filter(Boolean)).toHaveLength(29);
	});
});

describe("shiftMonth", () => {
	it("anda meses, virando o ano", () => {
		expect(shiftMonth("2026-11", 1)).toBe("2026-12");
		expect(shiftMonth("2026-12", 1)).toBe("2027-01");
		expect(shiftMonth("2026-01", -1)).toBe("2025-12");
	});
});

describe("diaryDayKind", () => {
	const checkins: Checkin[] = [
		{ mealId: "a", day: "2026-11-16", status: "done" },
		{ mealId: "b", day: "2026-11-16", status: "option" },
		{ mealId: "a", day: "2026-11-17", status: "done" },
		{ mealId: "a", day: "2026-11-15", status: "skipped" },
	];

	it("completo quando seguiu todas as refeições", () => {
		expect(diaryDayKind(checkins, 2, "2026-11-16")).toBe("full");
	});

	it("parte do dia com alguma marcação (até só furei)", () => {
		expect(diaryDayKind(checkins, 2, "2026-11-17")).toBe("partial");
		expect(diaryDayKind(checkins, 2, "2026-11-15")).toBe("partial");
	});

	it("vazio sem marcação", () => {
		expect(diaryDayKind(checkins, 2, "2026-11-14")).toBe("none");
	});
});

describe("weekdayLetter", () => {
	it("inicial do dia da semana", () => {
		expect(weekOf(TODAY).map(weekdayLetter).join("")).toBe("DSTQQSS");
	});
});

describe("diaryLongDate", () => {
	it("data por extenso pro relatório", () => {
		expect(diaryLongDate("2026-11-17")).toBe(
			"terça-feira, 17 de novembro de 2026",
		);
		expect(diaryLongDate("2026-11-15")).toBe("domingo, 15 de novembro de 2026");
	});
});

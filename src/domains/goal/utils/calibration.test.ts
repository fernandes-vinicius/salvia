import { describe, expect, it } from "vitest";

import {
	analyzeCalibration,
	calibrationWindowStart,
	describeWeeklyChange,
	type WeighIn,
} from "~/domains/goal/utils/calibration";

/** Pesagens semanais a partir de 01/09, com variação fixa por semana. */
function weekly(start: number, perWeek: number, weeks: number): WeighIn[] {
	return Array.from({ length: weeks }, (_, i) => {
		const date = new Date(Date.UTC(2026, 8, 1 + i * 7));
		return {
			date: date.toISOString().slice(0, 10),
			weightKg: start + perWeek * i,
		};
	});
}

const base = { today: "2026-10-01", since: null, calorieAdjustment: -500 };

describe("analyzeCalibration", () => {
	it("pede mais dados com menos de 3 pesagens ou 14 dias", () => {
		expect(
			analyzeCalibration({ ...base, weighIns: weekly(80, -0.5, 2) }),
		).toEqual({ kind: "need-data", weighIns: 2, days: 7 });

		expect(
			analyzeCalibration({
				...base,
				weighIns: [
					{ date: "2026-09-25", weightKg: 80 },
					{ date: "2026-09-28", weightKg: 79.8 },
					{ date: "2026-10-01", weightKg: 79.6 },
				],
			}).kind,
		).toBe("need-data");
	});

	it("está no ritmo quando a perda real é perto da esperada", () => {
		// -500 kcal/dia ≈ -0,45 kg/semana.
		const result = analyzeCalibration({
			...base,
			weighIns: weekly(80, -0.45, 4),
		});
		expect(result.kind).toBe("on-track");
	});

	it("sugere comer menos quando perde mais devagar que o esperado", () => {
		const result = analyzeCalibration({
			...base,
			weighIns: weekly(80, -0.2, 4),
		});
		// (−0,45 − −0,2) × 1100 ≈ −280 → −300 (arredonda de 50 em 50).
		expect(result).toMatchObject({ kind: "suggest", deltaKcal: -300 });
	});

	it("sugere comer mais quando perde rápido demais, limitado a 300", () => {
		const result = analyzeCalibration({
			...base,
			weighIns: weekly(80, -1.2, 4),
		});
		expect(result).toMatchObject({ kind: "suggest", deltaKcal: 300 });
	});

	it("na manutenção, corrige quem está ganhando peso", () => {
		const result = analyzeCalibration({
			...base,
			calorieAdjustment: 0,
			weighIns: weekly(70, 0.2, 4),
		});
		expect(result).toMatchObject({ kind: "suggest", deltaKcal: -200 });
	});

	it("ignora o sobe-e-desce e usa a tendência", () => {
		const result = analyzeCalibration({
			...base,
			weighIns: [
				{ date: "2026-09-01", weightKg: 80 },
				{ date: "2026-09-08", weightKg: 79.9 },
				{ date: "2026-09-15", weightKg: 79.2 },
				{ date: "2026-09-22", weightKg: 79.1 },
				{ date: "2026-09-29", weightKg: 78.2 },
			],
		});
		expect(result.kind).toBe("on-track");
	});

	it("recomeça a análise depois do último ajuste", () => {
		const result = analyzeCalibration({
			...base,
			since: "2026-09-20",
			weighIns: weekly(80, -0.2, 5),
		});
		expect(result).toMatchObject({ kind: "need-data", weighIns: 2 });
	});

	it("ignora pesagens fora das últimas 6 semanas", () => {
		const result = analyzeCalibration({
			...base,
			today: "2026-12-01",
			weighIns: weekly(80, -0.2, 4),
		});
		expect(result).toMatchObject({ kind: "need-data", weighIns: 0 });
	});
});

describe("analyzeCalibration com a adesão do check-in", () => {
	const slow = { ...base, weighIns: weekly(80, -0.2, 4) };

	it("não sugere mudar a meta com adesão baixa", () => {
		expect(
			analyzeCalibration({ ...slow, adherence: { percent: 60, days: 20 } }),
		).toMatchObject({ kind: "low-adherence", adherence: 60 });
	});

	it("com adesão boa, sugere e conta a adesão", () => {
		expect(
			analyzeCalibration({ ...slow, adherence: { percent: 90, days: 20 } }),
		).toMatchObject({ kind: "suggest", deltaKcal: -300, adherence: 90 });
	});

	it("com poucos dias de check-in, ignora a adesão", () => {
		expect(
			analyzeCalibration({ ...slow, adherence: { percent: 40, days: 3 } }),
		).toMatchObject({ kind: "suggest", adherence: null });
	});

	it("no ritmo, a adesão baixa não muda nada", () => {
		expect(
			analyzeCalibration({
				...base,
				weighIns: weekly(80, -0.45, 4),
				adherence: { percent: 50, days: 20 },
			}).kind,
		).toBe("on-track");
	});
});

describe("calibrationWindowStart", () => {
	it("é o maior entre 6 semanas atrás e o último ajuste", () => {
		expect(calibrationWindowStart("2026-10-20", null)).toBe("2026-09-08");
		expect(calibrationWindowStart("2026-10-20", "2026-10-01")).toBe(
			"2026-10-01",
		);
	});
});

describe("describeWeeklyChange", () => {
	it("descreve em linguagem simples", () => {
		expect(describeWeeklyChange(-0.42)).toBe("perdendo 0,4 kg");
		expect(describeWeeklyChange(0.25)).toBe("ganhando 0,3 kg");
		expect(describeWeeklyChange(0.01)).toBe("mantendo o peso");
	});
});

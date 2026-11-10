import { describe, expect, it } from "vitest";

import { plantThirst, waterMoment } from "~/domains/water/utils/water-moment";

describe("waterMoment", () => {
	it("watering below the goal says how much is left", () => {
		expect(
			waterMoment({
				level: null,
				added: 250,
				total: 1250,
				target: 2800,
				streak: 0,
			}),
		).toEqual({
			goal: false,
			title: "Regou! + 250 ml",
			subtitle: "Faltam 1,55 L pra ela ficar hidratada.",
		});
	});

	it("watering after the goal was met keeps it positive", () => {
		expect(
			waterMoment({
				level: null,
				added: 500,
				total: 3300,
				target: 2800,
				streak: 1,
			}),
		).toMatchObject({
			goal: false,
			title: "Regou! + 500 ml",
			subtitle: "Ela já está hidratada hoje.",
		});
	});

	it("hitting the goal takes the center of the screen", () => {
		expect(
			waterMoment({
				level: "day",
				added: 500,
				total: 2800,
				target: 2800,
				streak: 1,
			}),
		).toEqual({
			goal: true,
			title: "Plantinha hidratada!",
			subtitle: "Meta de água de hoje batida.",
		});
	});

	it("shows the streak when the goal was also met yesterday", () => {
		expect(
			waterMoment({
				level: "day",
				added: 250,
				total: 3000,
				target: 2800,
				streak: 2,
			}),
		).toMatchObject({ subtitle: "2 dias seguidos na meta de água." });
	});

	it("a streak milestone celebrates the days in a row", () => {
		expect(
			waterMoment({
				level: "milestone",
				added: 1000,
				total: 3000,
				target: 2800,
				streak: 7,
			}),
		).toEqual({
			goal: true,
			title: "7 dias bebendo água!",
			subtitle: "Meta de água batida. Sua plantinha agradece.",
		});
	});
});

describe("plantThirst", () => {
	it("is thirsty while less than 40% of the goal was drunk", () => {
		expect(plantThirst(0, 2800)).toBe("thirsty");
		expect(plantThirst(1100, 2800)).toBe("thirsty");
	});

	it("is fine from 40% until the goal", () => {
		expect(plantThirst(1120, 2800)).toBe("fine");
		expect(plantThirst(2799, 2800)).toBe("fine");
	});

	it("is hydrated once the goal is met", () => {
		expect(plantThirst(2800, 2800)).toBe("hydrated");
		expect(plantThirst(4000, 2800)).toBe("hydrated");
	});
});

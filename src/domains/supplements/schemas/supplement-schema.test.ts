import { describe, expect, it } from "vitest";

import {
	supplementFormSchema,
	supplementInputSchema,
} from "~/domains/supplements/schemas/supplement-schema";

const MEAL = "0b6f6a59-4c5e-4f0a-9d7e-1c2b3a4d5e6f";

const base = {
	name: "Creatina",
	dose: 5,
	unit: "g",
	timing: "meal",
	mealId: MEAL,
	time: null,
	days: "every_day",
	weekdays: [],
	note: null,
};

describe("supplementFormSchema", () => {
	it("aceita dose com vírgula e converte os dias", () => {
		const result = supplementFormSchema.safeParse({
			name: "Vitamina D",
			dose: "2,5",
			unit: "mcg",
			timing: "time",
			time: "08:00",
			days: "weekdays",
			weekdays: ["5", "1", "1"],
		});
		expect(result.success).toBe(true);
		expect(result.data).toMatchObject({
			dose: 2.5,
			time: "08:00",
			mealId: null,
			weekdays: [1, 5],
			note: null,
		});
	});

	it("recusa dose que não é número", () => {
		const result = supplementFormSchema.safeParse({
			name: "Creatina",
			dose: "cinco",
			unit: "g",
			timing: "wake_up",
			days: "every_day",
		});
		expect(result.success).toBe(false);
	});
});

describe("supplementInputSchema", () => {
	it("pede a refeição, o horário ou os dias quando a escolha precisa", () => {
		const issues = (input: object) =>
			supplementInputSchema
				.safeParse({ ...base, ...input })
				.error?.issues.map((issue) => issue.path.join("."));
		expect(issues({ mealId: null })).toEqual(["mealId"]);
		expect(issues({ timing: "time" })).toEqual(["time"]);
		expect(issues({ days: "weekdays" })).toEqual(["weekdays"]);
	});

	it("descarta o que não vale pra escolha feita", () => {
		const result = supplementInputSchema.parse({
			...base,
			timing: "bedtime",
			time: "22:00",
			weekdays: [1, 2],
			note: "  ",
		});
		expect(result).toMatchObject({
			mealId: null,
			time: null,
			weekdays: [],
			note: null,
		});
	});
});

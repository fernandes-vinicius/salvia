import { describe, expect, it } from "vitest";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	dayMicronutrients,
	ironTarget,
	micronutrientAlerts,
	SODIUM_LIMIT_MG,
} from "~/domains/diet/utils/micronutrients";
import type { Food } from "~/domains/food/types/food-types";

const food = (over: Partial<Food>): Food => ({
	id: "f",
	source: "taco",
	name: "Alimento",
	category: null,
	unit: "g",
	protein: 0,
	carbs: 0,
	fat: 0,
	fiber: 0,
	proteinSource: "vegetal",
	...over,
});

const meal = (items: DietMeal["items"]): DietMeal => ({
	id: "m",
	name: "Almoço",
	time: null,
	items,
});

describe("dayMicronutrients", () => {
	it("soma sódio e ferro pela quantidade", () => {
		const meals = [
			meal([
				{
					id: "1",
					quantity: 200,
					food: food({ sodium: 300, iron: 1.5 }),
					options: [],
				},
				{
					id: "2",
					quantity: 2,
					food: food({ unit: "unit", sodium: 100, iron: 0.5 }),
					options: [],
				},
			]),
		];
		expect(dayMicronutrients(meals)).toEqual({
			sodium: 800,
			iron: 4,
			customWithoutSodium: 0,
		});
	});

	it("conta os alimentos próprios sem sódio preenchido", () => {
		const meals = [
			meal([
				{
					id: "1",
					quantity: 30,
					food: food({ id: "whey", source: "custom" }),
					options: [],
				},
				{
					id: "2",
					quantity: 30,
					food: food({ id: "whey", source: "custom" }),
					options: [],
				},
			]),
		];
		expect(dayMicronutrients(meals).customWithoutSodium).toBe(1);
	});
});

describe("ironTarget", () => {
	it("segue a recomendação por sexo e idade", () => {
		expect(ironTarget({ sex: "male", ageYears: 30 })).toBe(8);
		expect(ironTarget({ sex: "female", ageYears: 30 })).toBe(18);
		expect(ironTarget({ sex: "female", ageYears: 55 })).toBe(8);
		expect(ironTarget({ sex: "female", ageYears: 16 })).toBe(15);
		expect(ironTarget({ sex: "male", ageYears: 16 })).toBe(11);
	});

	it("sem perfil não tem meta", () => {
		expect(ironTarget(null)).toBeNull();
	});
});

describe("micronutrientAlerts", () => {
	it("avisa sódio acima do limite e ferro abaixo da meta", () => {
		expect(
			micronutrientAlerts({
				micros: {
					sodium: SODIUM_LIMIT_MG + 400,
					iron: 9,
					customWithoutSodium: 0,
				},
				ironGoal: 18,
			}),
		).toEqual(["sodium-high", "iron-low"]);
	});

	it("fica quieto dentro das faixas e sem perfil", () => {
		expect(
			micronutrientAlerts({
				micros: { sodium: 1500, iron: 4, customWithoutSodium: 0 },
				ironGoal: null,
			}),
		).toEqual([]);
	});

	it("não avisa ferro com o dia quase vazio", () => {
		expect(
			micronutrientAlerts({
				micros: { sodium: 0, iron: 0, customWithoutSodium: 0 },
				ironGoal: 8,
			}),
		).toEqual([]);
	});
});

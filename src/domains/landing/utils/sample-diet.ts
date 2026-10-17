import type { DietMeal } from "~/domains/diet/types/diet-types";
import { dayMacros } from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food/types/food-types";
import { kcalFor } from "~/domains/food/utils/food";

// Dia de exemplo da landing (valores por 100 g da TACO; whey de rótulo).
// Renderizado com os mesmos componentes do app, pra mostrar a tela real.
function food(
	name: string,
	values: Pick<Food, "protein" | "carbs" | "fat" | "proteinSource">,
	source: Food["source"] = "taco",
): Food {
	return { id: name, source, name, category: null, unit: "g", ...values };
}

const ovo = food("Ovo, de galinha, inteiro, cozido", {
	protein: 13.3,
	carbs: 0.6,
	fat: 9.5,
	proteinSource: "animal",
});
const pao = food("Pão, trigo, forma, integral", {
	protein: 9.4,
	carbs: 49.9,
	fat: 3.7,
	proteinSource: "vegetal",
});
const banana = food("Banana, prata, crua", {
	protein: 1.3,
	carbs: 26,
	fat: 0.1,
	proteinSource: "vegetal",
});
const frango = food("Frango, peito, sem pele, grelhado", {
	protein: 32,
	carbs: 0,
	fat: 2.5,
	proteinSource: "animal",
});
const arroz = food("Arroz, tipo 1, cozido", {
	protein: 2.5,
	carbs: 28.1,
	fat: 0.2,
	proteinSource: "vegetal",
});
const feijao = food("Feijão, carioca, cozido", {
	protein: 4.8,
	carbs: 13.6,
	fat: 0.5,
	proteinSource: "vegetal",
});
const azeite = food("Azeite, de oliva, extra virgem", {
	protein: 0,
	carbs: 0,
	fat: 100,
	proteinSource: "vegetal",
});
const whey = food(
	"Whey protein (rótulo)",
	{ protein: 80, carbs: 7, fat: 4, proteinSource: "animal" },
	"custom",
);
const iogurte = food("Iogurte, natural, desnatado", {
	protein: 3.8,
	carbs: 5.8,
	fat: 0.3,
	proteinSource: "animal",
});
const batataDoce = food("Batata, doce, cozida", {
	protein: 0.6,
	carbs: 18.4,
	fat: 0.1,
	proteinSource: "vegetal",
});
const patinho = food("Carne, bovina, patinho, sem gordura, grelhado", {
	protein: 35.9,
	carbs: 0,
	fat: 7.3,
	proteinSource: "animal",
});
const aveia = food("Aveia, flocos, crua", {
	protein: 13.9,
	carbs: 66.6,
	fat: 8.5,
	proteinSource: "vegetal",
});

export const SAMPLE_MEALS: DietMeal[] = [
	{
		id: "cafe",
		name: "Café da manhã",
		time: "07:00",
		items: [
			{ id: "c1", quantity: 150, food: ovo },
			{ id: "c2", quantity: 50, food: pao },
			{ id: "c3", quantity: 100, food: banana },
		],
	},
	{
		id: "almoco",
		name: "Almoço",
		time: "12:30",
		items: [
			{ id: "a1", quantity: 150, food: frango },
			{ id: "a2", quantity: 150, food: arroz },
			{ id: "a3", quantity: 100, food: feijao },
			{ id: "a4", quantity: 10, food: azeite },
		],
	},
	{
		id: "pos-treino",
		name: "Pós-treino",
		time: "17:30",
		items: [
			{ id: "p1", quantity: 30, food: whey },
			{ id: "p2", quantity: 40, food: aveia },
			{ id: "p3", quantity: 100, food: banana },
		],
	},
	{
		id: "jantar",
		name: "Jantar",
		time: "20:30",
		items: [
			{ id: "j1", quantity: 150, food: patinho },
			{ id: "j2", quantity: 200, food: batataDoce },
			{ id: "j3", quantity: 10, food: azeite },
		],
	},
	{
		id: "ceia",
		name: "Ceia",
		time: "22:30",
		items: [
			{ id: "l1", quantity: 170, food: iogurte },
			{ id: "l2", quantity: 30, food: aveia },
		],
	},
];

/**
 * Pessoa do exemplo: 80 kg, em cutting. O gasto é o planejado + 500 kcal,
 * pro resumo mostrar o déficit típico de quem quer secar.
 */
export const SAMPLE_PROFILE = {
	weightKg: 80,
	tdee: Math.round(kcalFor(dayMacros(SAMPLE_MEALS))) + 500,
};

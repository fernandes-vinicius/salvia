import type { DietMeal } from "~/domains/diet/types/diet-types";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import type { Food } from "~/domains/food/types/food-types";
import type { Goal } from "~/domains/goal/types/goal-types";
import { analyzeCalibration } from "~/domains/goal/utils/calibration";
import { calculateTargets } from "~/domains/goal/utils/goal";
import type {
	Measurement,
	MeasurementValues,
} from "~/domains/measurements/types/measurement-types";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import { calculateBmr, calculateEnergy } from "~/domains/profile/utils/energy";
import { buildShoppingList } from "~/domains/shopping/utils/shopping-list";

// Persona da landing: 28 anos, 80 kg, musculação 5×/semana e cardio 3×, em
// cutting. Tudo é calculado com as mesmas funções do app e renderizado com
// os mesmos componentes, pra landing mostrar as telas reais.

export const SAMPLE_PROFILE: BodyProfile = {
	sex: "male",
	ageYears: 28,
	weightKg: 80,
	heightCm: 178,
	neatFactor: 1.15,
	strength: { enabled: true, daysPerWeek: 5, minutesPerSession: 60, met: 5.5 },
	cardio: { enabled: true, daysPerWeek: 3, minutesPerSession: 30, met: 6.25 },
};

export const SAMPLE_GOAL: Goal = {
	objective: "lose",
	calorieAdjustment: -500,
	proteinPerKg: 2.2,
	fatPerKg: 0.8,
	carbsPerKg: null,
};

export const SAMPLE_ENERGY = calculateEnergy(SAMPLE_PROFILE);

export const SAMPLE_TARGETS = calculateTargets(SAMPLE_GOAL, {
	tdee: SAMPLE_ENERGY.tdee,
	bmr: calculateBmr(SAMPLE_PROFILE),
	weightKg: SAMPLE_PROFILE.weightKg,
});

// Dia de exemplo (valores por 100 g da TACO; whey de rótulo), montado pra
// fechar perto da meta acima.
function food(
	name: string,
	values: Pick<Food, "protein" | "carbs" | "fat" | "proteinSource"> & {
		category?: string;
	},
	source: Food["source"] = "taco",
): Food {
	return { id: name, source, name, category: null, unit: "g", ...values };
}

const ovo = food("Ovo, de galinha, inteiro, cozido/10minutos", {
	category: "Ovos e derivados",
	protein: 13.3,
	carbs: 0.6,
	fat: 9.5,
	proteinSource: "animal",
});
const pao = food("Pão, trigo, forma, integral", {
	category: "Cereais e derivados",
	protein: 9.4,
	carbs: 49.9,
	fat: 3.7,
	proteinSource: "vegetal",
});
const banana = food("Banana, prata, crua", {
	category: "Frutas e derivados",
	protein: 1.3,
	carbs: 26,
	fat: 0.1,
	proteinSource: "vegetal",
});
const frango = food("Frango, peito, sem pele, grelhado", {
	category: "Carnes e derivados",
	protein: 32,
	carbs: 0,
	fat: 2.5,
	proteinSource: "animal",
});
export const arroz = food("Arroz, tipo 1, cozido", {
	category: "Cereais e derivados",
	protein: 2.5,
	carbs: 28.1,
	fat: 0.2,
	proteinSource: "vegetal",
});
const feijao = food("Feijão, carioca, cozido", {
	category: "Leguminosas e derivados",
	protein: 4.8,
	carbs: 13.6,
	fat: 0.5,
	proteinSource: "vegetal",
});
const azeite = food("Azeite, de oliva, extra virgem", {
	category: "Gorduras e óleos",
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
	category: "Leite e derivados",
	protein: 3.8,
	carbs: 5.8,
	fat: 0.3,
	proteinSource: "animal",
});
export const batataDoce = food("Batata, doce, cozida", {
	category: "Verduras, hortaliças e derivados",
	protein: 0.6,
	carbs: 18.4,
	fat: 0.1,
	proteinSource: "vegetal",
});
const patinho = food("Carne, bovina, patinho, sem gordura, grelhado", {
	category: "Carnes e derivados",
	protein: 35.9,
	carbs: 0,
	fat: 7.3,
	proteinSource: "animal",
});
const aveia = food("Aveia, flocos, crua", {
	category: "Cereais e derivados",
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
			{ id: "c2", quantity: 40, food: pao },
			{ id: "c3", quantity: 100, food: banana },
		],
	},
	{
		id: "almoco",
		name: "Almoço",
		time: "12:30",
		items: [
			{ id: "a1", quantity: 180, food: frango },
			{ id: "a2", quantity: 150, food: arroz },
			{ id: "a3", quantity: 100, food: feijao },
			{ id: "a4", quantity: 12, food: azeite },
		],
	},
	{
		id: "pos-treino",
		name: "Pós-treino",
		time: "17:30",
		items: [
			{ id: "p1", quantity: 40, food: whey },
			{ id: "p2", quantity: 40, food: aveia },
		],
	},
	{
		id: "jantar",
		name: "Jantar",
		time: "20:30",
		items: [
			{ id: "j1", quantity: 170, food: patinho },
			{ id: "j2", quantity: 260, food: batataDoce },
			{ id: "j3", quantity: 10, food: azeite },
		],
	},
	{
		id: "ceia",
		name: "Ceia",
		time: "22:30",
		items: [
			{ id: "l1", quantity: 170, food: iogurte },
			{ id: "l2", quantity: 20, food: aveia },
		],
	},
];

export const SAMPLE_SUMMARY = summarizeDiet(SAMPLE_MEALS, {
	weightKg: SAMPLE_PROFILE.weightKg,
	tdee: SAMPLE_ENERGY.tdee,
});

const EMPTY_VALUES: MeasurementValues = {
	weightKg: null,
	waistCm: null,
	neckCm: null,
	shoulderCm: null,
	chestCm: null,
	bicepsLeftCm: null,
	bicepsRightCm: null,
	forearmLeftCm: null,
	forearmRightCm: null,
	abdomenCm: null,
	hipsCm: null,
	thighLeftCm: null,
	thighRightCm: null,
	calfLeftCm: null,
	calfRightCm: null,
};

// Três meses de cutting: peso, cintura e abdômen caindo, braço mantido.
export const SAMPLE_MEASUREMENTS: Measurement[] = [
	["2026-06-01", 86.4, 92, 95, 101, 38.5],
	["2026-06-22", 85.1, 90.5, 93.5, 100.5, 38.5],
	["2026-07-13", 83.6, 89, 92, 99.5, 38.3],
	["2026-08-03", 82.4, 87.5, 90, 99, 38.4],
	["2026-08-24", 81.1, 86, 88.5, 98, 38.2],
	["2026-09-14", 80, 85, 87, 97.5, 38.3],
].map(([measuredOn, weightKg, waistCm, abdomenCm, hipsCm, biceps]) => ({
	...EMPTY_VALUES,
	id: String(measuredOn),
	measuredOn: String(measuredOn),
	weightKg: Number(weightKg),
	waistCm: Number(waistCm),
	abdomenCm: Number(abdomenCm),
	hipsCm: Number(hipsCm),
	bicepsRightCm: Number(biceps),
}));

// Depois da última medição, o peso desacelera (perde ~0,15 kg/semana em vez
// de ~0,45): é o caso em que o ajuste pelo peso sugere comer menos.
export const SAMPLE_CALIBRATION = analyzeCalibration({
	weighIns: [
		{ date: "2026-09-14", weightKg: 80 },
		{ date: "2026-09-21", weightKg: 79.8 },
		{ date: "2026-09-28", weightKg: 79.7 },
		{ date: "2026-10-05", weightKg: 79.5 },
	],
	today: "2026-10-05",
	since: null,
	calorieAdjustment: SAMPLE_GOAL.calorieAdjustment,
});

/** Uma semana de compras da dieta de exemplo. */
export const SAMPLE_SHOPPING = buildShoppingList(SAMPLE_MEALS, 7);

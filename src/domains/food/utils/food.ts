import type {
	Food,
	FoodUnit,
	Macros,
	ProteinSource,
} from "~/domains/food/types/food-types";

/** Minúsculas, sem acento e espaços colapsados: "Pão  Francês" → "pao frances". */
export function normalizeSearchText(text: string) {
	return text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

export const UNIT_LABELS: Record<FoodUnit, { short: string; base: string }> = {
	g: { short: "g", base: "100 g" },
	ml: { short: "ml", base: "100 ml" },
	unit: { short: "un", base: "1 unidade" },
};

const QUANTITY_RANGES = {
	weight: { min: 5, max: 1000, step: 5, chips: [50, 100, 150, 200, 300] },
	unit: { min: 0.5, max: 20, step: 0.5, chips: [1, 2, 3, 4] },
} as const;

export function quantityRangeFor(unit: FoodUnit) {
	return unit === "unit" ? QUANTITY_RANGES.unit : QUANTITY_RANGES.weight;
}

/** Quantidade padrão ao adicionar: 100 g/ml ou 1 unidade. */
export function defaultQuantityFor(unit: FoodUnit) {
	return unit === "unit" ? 1 : 100;
}

/** Macros de uma porção: valores do alimento escalados pela quantidade. */
export function macrosFor(
	food: Pick<Food, "unit" | "protein" | "carbs" | "fat" | "proteinSource">,
	quantity: number,
): Macros {
	const factor = food.unit === "unit" ? quantity : quantity / 100;
	const protein = food.protein * factor;
	return {
		proteinAnimal: food.proteinSource === "animal" ? protein : 0,
		proteinVegetal: food.proteinSource === "vegetal" ? protein : 0,
		carbs: food.carbs * factor,
		fat: food.fat * factor,
	};
}

/** kcal pelos macros (4/4/9), igual à planilha. */
export function kcalFor({ proteinAnimal, proteinVegetal, carbs, fat }: Macros) {
	return (proteinAnimal + proteinVegetal) * 4 + carbs * 4 + fat * 9;
}

export function sumMacros(list: Macros[]): Macros {
	return list.reduce(
		(sum, m) => ({
			proteinAnimal: sum.proteinAnimal + m.proteinAnimal,
			proteinVegetal: sum.proteinVegetal + m.proteinVegetal,
			carbs: sum.carbs + m.carbs,
			fat: sum.fat + m.fat,
		}),
		{ proteinAnimal: 0, proteinVegetal: 0, carbs: 0, fat: 0 },
	);
}

// --- TACO -----------------------------------------------------------------

/** Categorias TACO cuja proteína é animal. */
const ANIMAL_CATEGORY_IDS = new Set([5, 6, 7, 9]); // pescados, carnes, leite, ovos
/** Categorias mistas: decide pelo nome do alimento. */
const MIXED_CATEGORY_IDS = new Set([11, 12, 13]); // miscelâneas, industrializados, preparados

const ANIMAL_KEYWORDS = [
	"carne",
	"frango",
	"boi",
	"porco",
	"suino",
	"peixe",
	"atum",
	"sardinha",
	"bacalhau",
	"camarao",
	"caranguejo",
	"lula",
	"ovo",
	"queijo",
	"leite",
	"iogurte",
	"presunto",
	"salsicha",
	"linguica",
	"mortadela",
	"bacon",
	"hamburguer",
	"almondega",
	"feijoada",
	"strogonoff",
	"estrogonofe",
	"kibe",
	"quibe",
	"coxinha",
	"pastel de carne",
	"empada de frango",
	"risoto",
	"mocoto",
	"buchada",
	"dobradinha",
	"galinha",
	"peru",
	"pato",
	"cordeiro",
	"carneiro",
	"cabrito",
	"figado",
	"manteiga",
	"requeijao",
	"creme de leite",
	"whey",
	// Pratos regionais cuja proteína vem principalmente de carne/frutos do mar.
	"bife",
	"carreteiro",
	"barreado",
	"charuto",
	"bolognesa",
	"manicoba",
	"sarapatel",
	"vaca atolada",
	"vatapa",
	"virado a paulista",
	"yakisoba",
];

/** Nomes que casariam com uma palavra-chave mas são de origem vegetal. */
const VEGETAL_EXCEPTIONS = ["leite, de coco", "quibebe", "tapioca"];

export function tacoProteinSource(
	categoryId: number,
	name: string,
): ProteinSource {
	if (ANIMAL_CATEGORY_IDS.has(categoryId)) return "animal";
	if (MIXED_CATEGORY_IDS.has(categoryId)) {
		const normalized = normalizeSearchText(name);
		if (VEGETAL_EXCEPTIONS.some((word) => normalized.startsWith(word))) {
			return "vegetal";
		}
		if (ANIMAL_KEYWORDS.some((word) => normalized.includes(word))) {
			return "animal";
		}
	}
	return "vegetal";
}

/** Parser CSV mínimo (RFC 4180: aspas, vírgulas e aspas duplas escapadas). */
export function parseCsv(content: string): Record<string, string>[] {
	const rows: string[][] = [];
	let field = "";
	let row: string[] = [];
	let inQuotes = false;

	for (let i = 0; i < content.length; i++) {
		const char = content[i];
		if (inQuotes) {
			if (char === '"' && content[i + 1] === '"') {
				field += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n" || char === "\r") {
			if (char === "\r" && content[i + 1] === "\n") i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += char;
		}
	}
	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	const [header, ...data] = rows.filter((r) => r.some((cell) => cell !== ""));
	if (!header) return [];
	return data.map((cells) =>
		Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ""])),
	);
}

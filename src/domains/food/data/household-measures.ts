// Medidas caseiras (colher, concha, fatia, unidade) pra quem não pesa tudo.
// Chave: nome exato na TACO (como em `purchase-rules.ts`); sem ela, as
// palavras-chave de `MEASURE_KEYWORDS` cobrem alimentos próprios (whey, óleos).
// Valores médios das tabelas brasileiras de medidas caseiras (IBGE/POF e
// Pinheiro et al.): variam com o tamanho da colher e o quanto enche, por isso
// a tela sempre mostra "≈". A primeira medida da lista é a principal.

export interface HouseholdMeasure {
	/** "colher de sopa" */
	singular: string;
	/** "colheres de sopa" */
	plural: string;
	/** Forma curta pra grade: "col. sopa". */
	short: string;
	/** Forma curta no plural, quando muda ("fatias"). */
	shortPlural?: string;
	/** Gramas (ou ml) de 1 medida. */
	grams: number;
}

const colherSopa = (grams: number): HouseholdMeasure => ({
	singular: "colher de sopa",
	plural: "colheres de sopa",
	short: "col. sopa",
	grams,
});
const colherCha = (grams: number): HouseholdMeasure => ({
	singular: "colher de chá",
	plural: "colheres de chá",
	short: "col. chá",
	grams,
});
const concha = (grams: number): HouseholdMeasure => ({
	singular: "concha média",
	plural: "conchas médias",
	short: "concha",
	shortPlural: "conchas",
	grams,
});
const escumadeira = (grams: number): HouseholdMeasure => ({
	singular: "escumadeira",
	plural: "escumadeiras",
	short: "escumadeira",
	shortPlural: "escumadeiras",
	grams,
});
const fatia = (grams: number): HouseholdMeasure => ({
	singular: "fatia",
	plural: "fatias",
	short: "fatia",
	shortPlural: "fatias",
	grams,
});
const unidade = (
	grams: number,
	singular = "unidade média",
): HouseholdMeasure => ({
	singular,
	plural: singular === "unidade média" ? "unidades médias" : `${singular}s`,
	short: "un",
	grams,
});
const copo = (grams: number): HouseholdMeasure => ({
	singular: "copo (200 ml)",
	plural: "copos (200 ml)",
	short: "copo",
	shortPlural: "copos",
	grams,
});
const fileMedio = (grams: number, name = "filé médio"): HouseholdMeasure => ({
	singular: name,
	plural: name.replace(/(\S+) (\S+)/, "$1s $2s"),
	short: name.split(" ")[0],
	shortPlural: `${name.split(" ")[0]}s`,
	grams,
});

export const HOUSEHOLD_MEASURES: Record<string, HouseholdMeasure[]> = {
	// Cereais e massas
	"Arroz, tipo 1, cozido": [colherSopa(25), escumadeira(90)],
	"Arroz, integral, cozido": [colherSopa(20), escumadeira(80)],
	"Aveia, flocos, crua": [colherSopa(15)],
	"Farinha, de mandioca, torrada": [colherSopa(16)],
	"Pão, trigo, forma, integral": [fatia(25)],
	"Pão, trigo, francês": [unidade(50)],
	"Pão, trigo, sovado": [unidade(50)],
	"Pão, de queijo, assado": [unidade(20, "unidade pequena")],
	// Leguminosas
	"Feijão, carioca, cozido": [concha(86), colherSopa(20)],
	"Feijão, preto, cozido": [concha(86), colherSopa(20)],
	// Tubérculos e hortaliças
	"Batata, doce, cozida": [unidade(150)],
	"Batata, inglesa, cozida": [unidade(130)],
	"Tomate, com semente, cru": [unidade(100), fatia(15)],
	"Cenoura, crua": [colherSopa(12), unidade(120)],
	// Frutas
	"Banana, prata, crua": [unidade(70)],
	"Banana, nanica, crua": [unidade(90)],
	"Maçã, Fuji, com casca, crua": [unidade(130)],
	"Maçã, Argentina, com casca, crua": [unidade(130)],
	"Mamão, Papaia, cru": [
		{
			singular: "metade",
			plural: "metades",
			short: "metade",
			shortPlural: "metades",
			grams: 150,
		},
	],
	"Mamão, Formosa, cru": [fatia(170)],
	"Laranja, baía, crua": [unidade(130)],
	"Laranja, lima, crua": [unidade(130)],
	"Laranja, da terra, crua": [unidade(130)],
	"Laranja, baía, suco": [copo(200)],
	// Carnes, ovos e peixes
	"Ovo, de galinha, inteiro, cru": [unidade(50)],
	"Ovo, de galinha, inteiro, cozido/10minutos": [unidade(50)],
	"Ovo, de galinha, inteiro, frito": [unidade(50)],
	"Ovo, de galinha, clara, cozida/10minutos": [unidade(30, "clara")],
	"Frango, peito, sem pele, grelhado": [fileMedio(100)],
	"Frango, peito, sem pele, cozido": [fileMedio(100)],
	"Carne, bovina, patinho, sem gordura, grelhado": [
		fileMedio(100, "bife médio"),
	],
	"Carne, bovina, acém, moído, cozido": [colherSopa(25)],
	"Atum, conserva em óleo": [
		{
			singular: "lata (escorrida)",
			plural: "latas (escorridas)",
			short: "lata",
			shortPlural: "latas",
			grams: 120,
		},
	],
	// Leite e derivados
	"Leite, de vaca, integral": [copo(200)],
	"Leite, de vaca, desnatado, UHT": [copo(200)],
	"Leite, de vaca, integral, pó": [colherSopa(16)],
	"Leite, de vaca, desnatado, pó": [colherSopa(12)],
	"Iogurte, natural": [unidade(170, "pote")],
	"Iogurte, natural, desnatado": [unidade(170, "pote")],
	"Queijo, minas, frescal": [fatia(30)],
	"Queijo, mozarela": [fatia(15)],
	"Manteiga, com sal": [colherCha(5)],
	"Manteiga, sem sal": [colherCha(5)],
	// Óleos, açúcares e sementes
	"Azeite, de oliva, extra virgem": [colherSopa(8)],
	"Óleo, de soja": [colherSopa(8)],
	"Açúcar, refinado": [colherCha(5), colherSopa(12)],
	"Açúcar, cristal": [colherCha(5), colherSopa(12)],
	"Mel, de abelha": [colherSopa(20)],
	"Amendoim, torrado, salgado": [colherSopa(15)],
	"Linhaça, semente": [colherSopa(10)],
	"Café, infusão 10%": [
		{
			singular: "xícara de café",
			plural: "xícaras de café",
			short: "xíc.",
			grams: 50,
		},
	],
};

/**
 * Palavras-chave (nome sem acento, minúsculo) pra alimentos fora da tabela,
 * principalmente os cadastrados pelo usuário. A primeira que aparecer vale.
 */
export const MEASURE_KEYWORDS: [
	keyword: string,
	measures: HouseholdMeasure[],
][] = [
	[
		"whey",
		[
			{
				singular: "dose (scoop)",
				plural: "doses (scoop)",
				short: "dose",
				shortPlural: "doses",
				grams: 30,
			},
		],
	],
	["pasta de amendoim", [colherSopa(15)]],
	["requeijao", [colherSopa(30)]],
	["azeite", [colherSopa(8)]],
	["oleo", [colherSopa(8)]],
	["granola", [colherSopa(10)]],
	["chia", [colherSopa(10)]],
];

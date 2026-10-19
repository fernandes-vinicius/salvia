// Preços de referência pra estimar o custo da dieta, pelo nome do item na
// lista de compras (o de `purchase-rules.ts` ou o da TACO). São médias
// aproximadas de supermercado no Brasil (base: IPCA/IBGE e cesta básica do
// DIEESE), revisadas de tempos em tempos: a tela sempre mostra "≈" e cada
// pessoa pode trocar pelo preço do mercado dela (tabela `food_price`).

export type PriceUnit = "kg" | "L" | "un" | "dz";

export interface Price {
	/** Reais por `per`. */
	value: number;
	per: PriceUnit;
}

/** Mês da última revisão dos preços abaixo. */
export const REFERENCE_PRICES_UPDATED_AT = "outubro de 2026";

const kg = (value: number): Price => ({ value, per: "kg" });
const liter = (value: number): Price => ({ value, per: "L" });
const dozen = (value: number): Price => ({ value, per: "dz" });

export const REFERENCE_PRICES: Record<string, Price> = {
	// Mercearia
	Arroz: kg(6),
	"Arroz integral": kg(8),
	"Feijão carioca": kg(8),
	"Feijão preto": kg(9),
	"Flocão de milho": kg(6),
	"Aveia em flocos": kg(20),
	Macarrão: kg(10),
	"Farinha de mandioca": kg(9),
	"Farinha, de mandioca, torrada": kg(10),
	"Açúcar, refinado": kg(5),
	"Açúcar, cristal": kg(5),
	Mel: kg(50),
	"Amendoim torrado": kg(30),
	"Linhaça, semente": kg(20),
	"Azeite extra virgem": liter(100),
	"Óleo, de soja": liter(9),
	"Sardinha em lata": kg(56),
	"Atum, conserva em óleo": kg(75),
	"Leite em pó integral": kg(50),
	"Leite, de vaca, desnatado, pó": kg(55),
	// Açougue e peixaria
	"Peito de frango sem pele": kg(22),
	"Peito de frango com pele": kg(18),
	"Coxa de frango": kg(14),
	"Coxa de frango sem pele": kg(17),
	"Sobrecoxa de frango": kg(15),
	"Sobrecoxa de frango sem pele": kg(18),
	"Acém moído": kg(35),
	Acém: kg(33),
	Patinho: kg(45),
	Músculo: kg(33),
	"Fígado bovino": kg(20),
	Sardinha: kg(20),
	// Laticínios e ovos
	Ovos: dozen(10),
	"Leite, de vaca, integral": liter(6),
	"Leite, de vaca, desnatado, UHT": liter(6),
	"Iogurte natural": kg(18),
	"Iogurte natural desnatado": kg(18),
	"Queijo minas frescal": kg(45),
	"Queijo minas meia cura": kg(55),
	"Queijo, mozarela": kg(50),
	"Manteiga, com sal": kg(60),
	"Manteiga, sem sal": kg(60),
	// Padaria
	"Pão francês": kg(18),
	"Pão de forma integral": kg(20),
	// Hortifrúti
	"Banana-prata": kg(7),
	"Banana-nanica": kg(6),
	"Batata-doce": kg(6),
	"Batata, inglesa, cozida": kg(6),
	Mandioca: kg(6),
	Beterraba: kg(6),
	Cenoura: kg(6),
	Tomate: kg(9),
	"Alface crespa": kg(16),
	Repolho: kg(5),
	Abacate: kg(10),
	"Maçã, Fuji, com casca, crua": kg(12),
	"Maçã, Argentina, com casca, crua": kg(14),
	"Mamão, Formosa, cru": kg(7),
	"Mamão, Papaia, cru": kg(9),
	"Laranja, baía, crua": kg(5),
	"Laranja, lima, crua": kg(6),
};

/**
 * Palavras-chave (nome sem acento, minúsculo) pra itens fora da tabela,
 * principalmente alimentos cadastrados pelo usuário.
 */
export const PRICE_KEYWORDS: [keyword: string, price: Price][] = [
	["whey", kg(120)],
	["pasta de amendoim", kg(40)],
	["requeijao", kg(40)],
	["granola", kg(35)],
	["chia", kg(40)],
];

// Como cada alimento da dieta vira item de mercado. Chave: nome exato na TACO
// (único e estável). Sem regra, o alimento entra com o próprio nome e peso.
//
// `rawPerGram`: gramas a comprar (cru) por grama do alimento pronto na dieta.
// Valores de rendimento usuais de cozinha: arroz rende ~2,8× o peso cru,
// feijão ~2,5×, carnes perdem ~25–30% de água. É estimativa, por isso a lista
// mostra "≈".

export interface PurchaseUnit {
	/** Peso médio de 1 unidade (g). */
	grams: number;
	singular: string;
	plural: string;
	/** Mostrar também em dúzias (ovos). */
	dozen?: boolean;
}

export interface PurchaseRule {
	/** Nome na lista (itens com o mesmo nome se somam). */
	name: string;
	rawPerGram?: number;
	unit?: PurchaseUnit;
	section?: ShoppingSection;
}

export type ShoppingSection =
	| "Hortifrúti"
	| "Açougue e peixaria"
	| "Laticínios e ovos"
	| "Padaria"
	| "Mercearia"
	| "Bebidas"
	| "Outros";

/** Ordem das seções na lista (como se anda no mercado). */
export const SECTION_ORDER: ShoppingSection[] = [
	"Hortifrúti",
	"Açougue e peixaria",
	"Laticínios e ovos",
	"Padaria",
	"Mercearia",
	"Bebidas",
	"Outros",
];

/** Categoria da TACO → seção do mercado. */
export const CATEGORY_SECTIONS: Record<string, ShoppingSection> = {
	"Frutas e derivados": "Hortifrúti",
	"Verduras, hortaliças e derivados": "Hortifrúti",
	"Carnes e derivados": "Açougue e peixaria",
	"Pescados e frutos do mar": "Açougue e peixaria",
	"Ovos e derivados": "Laticínios e ovos",
	"Leite e derivados": "Laticínios e ovos",
	"Cereais e derivados": "Mercearia",
	"Leguminosas e derivados": "Mercearia",
	"Nozes e sementes": "Mercearia",
	"Gorduras e óleos": "Mercearia",
	"Produtos açucarados": "Mercearia",
	Miscelâneas: "Mercearia",
	"Outros alimentos industrializados": "Mercearia",
	"Alimentos preparados": "Mercearia",
	"Bebidas (alcoólicas e não alcoólicas)": "Bebidas",
};

const EGGS: PurchaseRule = {
	name: "Ovos",
	unit: { grams: 50, singular: "ovo", plural: "ovos", dozen: true },
};
const CHICKEN_BREAST: PurchaseRule = {
	name: "Peito de frango sem pele",
	rawPerGram: 1.4,
};

/** Mesmo item comprado cru (soma com a versão pronta, peso igual). */
const raw = (name: string): PurchaseRule => ({ name, rawPerGram: 1 });
/** Só um nome de mercado mais curto que o da TACO. */
const named = (name: string): PurchaseRule => ({ name });

export const PURCHASE_RULES: Record<string, PurchaseRule> = {
	"Arroz, tipo 1, cozido": { name: "Arroz", rawPerGram: 0.36 },
	"Feijão, carioca, cozido": { name: "Feijão carioca", rawPerGram: 0.4 },
	"Feijão, preto, cozido": { name: "Feijão preto", rawPerGram: 0.4 },
	"Arroz, integral, cozido": { name: "Arroz integral", rawPerGram: 0.4 },
	"Cuscuz, de milho, cozido com sal": {
		name: "Flocão de milho",
		rawPerGram: 0.45,
	},
	"Frango, peito, sem pele, cozido": CHICKEN_BREAST,
	"Frango, peito, sem pele, grelhado": CHICKEN_BREAST,
	"Frango, peito, com pele, assado": {
		name: "Peito de frango com pele",
		rawPerGram: 1.4,
	},
	"Frango, coxa, sem pele, cozida": {
		name: "Coxa de frango sem pele",
		rawPerGram: 1.4,
	},
	"Frango, coxa, com pele, assada": {
		name: "Coxa de frango",
		rawPerGram: 1.4,
	},
	"Frango, sobrecoxa, com pele, assada": {
		name: "Sobrecoxa de frango",
		rawPerGram: 1.4,
	},
	"Frango, sobrecoxa, sem pele, assada": {
		name: "Sobrecoxa de frango sem pele",
		rawPerGram: 1.4,
	},
	"Carne, bovina, acém, moído, cozido": {
		name: "Acém moído",
		rawPerGram: 1.35,
	},
	"Carne, bovina, acém, sem gordura, cozido": {
		name: "Acém",
		rawPerGram: 1.35,
	},
	"Carne, bovina, patinho, sem gordura, grelhado": {
		name: "Patinho",
		rawPerGram: 1.45,
	},
	"Carne, bovina, músculo, sem gordura, cozido": {
		name: "Músculo",
		rawPerGram: 1.4,
	},
	"Carne, bovina, fígado, grelhado": {
		name: "Fígado bovino",
		rawPerGram: 1.35,
	},
	"Sardinha, assada": { name: "Sardinha", rawPerGram: 1.3 },
	"Sardinha, frita": { name: "Sardinha", rawPerGram: 1.3 },
	"Batata, doce, cozida": { name: "Batata-doce", rawPerGram: 1 },
	"Mandioca, cozida": { name: "Mandioca", rawPerGram: 1 },
	"Beterraba, cozida": { name: "Beterraba", rawPerGram: 1 },
	"Cenoura, cozida": { name: "Cenoura", rawPerGram: 1 },
	"Ovo, de galinha, inteiro, cru": EGGS,
	"Ovo, de galinha, inteiro, cozido/10minutos": EGGS,
	"Ovo, de galinha, inteiro, frito": EGGS,
	"Banana, prata, crua": {
		name: "Banana-prata",
		unit: { grams: 60, singular: "banana", plural: "bananas" },
	},
	"Banana, nanica, crua": {
		name: "Banana-nanica",
		unit: { grams: 90, singular: "banana", plural: "bananas" },
	},
	"Pão, trigo, francês": {
		name: "Pão francês",
		section: "Padaria",
		unit: { grams: 50, singular: "pão", plural: "pães" },
	},
	// Versões cruas: somam com as prontas acima.
	"Arroz, tipo 1, cru": raw("Arroz"),
	"Feijão, carioca, cru": raw("Feijão carioca"),
	"Feijão, preto, cru": raw("Feijão preto"),
	"Arroz, integral, cru": raw("Arroz integral"),
	"Frango, peito, sem pele, cru": raw("Peito de frango sem pele"),
	"Frango, peito, com pele, cru": raw("Peito de frango com pele"),
	"Frango, coxa, sem pele, crua": raw("Coxa de frango sem pele"),
	"Frango, coxa, com pele, crua": raw("Coxa de frango"),
	"Carne, bovina, acém, moído, cru": raw("Acém moído"),
	"Carne, bovina, patinho, sem gordura, cru": raw("Patinho"),
	"Carne, bovina, músculo, sem gordura, cru": raw("Músculo"),
	"Sardinha, inteira, crua": raw("Sardinha"),
	"Batata, doce, crua": raw("Batata-doce"),
	"Mandioca, crua": raw("Mandioca"),
	"Beterraba, crua": raw("Beterraba"),
	"Cenoura, crua": raw("Cenoura"),
	// Nomes de mercado.
	"Leite, de vaca, integral, pó": named("Leite em pó integral"),
	"Aveia, flocos, crua": named("Aveia em flocos"),
	"Azeite, de oliva, extra virgem": named("Azeite extra virgem"),
	"Amendoim, torrado, salgado": named("Amendoim torrado"),
	"Alface, crespa, crua": named("Alface crespa"),
	"Tomate, com semente, cru": named("Tomate"),
	"Repolho, branco, cru": named("Repolho"),
	"Abacate, cru": named("Abacate"),
	"Iogurte, natural": named("Iogurte natural"),
	"Iogurte, natural, desnatado": named("Iogurte natural desnatado"),
	"Queijo, minas, frescal": named("Queijo minas frescal"),
	"Queijo, minas, meia cura": named("Queijo minas meia cura"),
	"Macarrão, trigo, cru": named("Macarrão"),
	"Farinha, de mandioca, crua": named("Farinha de mandioca"),
	"Mel, de abelha": named("Mel"),
	"Sardinha, conserva em óleo": named("Sardinha em lata"),
	"Pão, trigo, forma, integral": {
		name: "Pão de forma integral",
		section: "Padaria",
		unit: { grams: 25, singular: "fatia", plural: "fatias" },
	},
};

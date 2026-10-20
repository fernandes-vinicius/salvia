// Alimentos que podem entrar como troca numa receita (nome exato da TACO):
// os comuns no mercado e na cozinha de casa. Sem essa lista, o macro mais
// parecido costuma ser algo raro (jamelão, fruta-pão, massa de pastel crua).
// Alimento comum faltando? Adicione aqui (conferindo se a TACO tem os
// macros; lacunas são preenchidas em `tacoMacros`).
export const SWAP_FOODS = [
	// Frutas
	"Abacaxi, cru",
	"Banana, nanica, crua",
	"Banana, prata, crua",
	"Goiaba, vermelha, com casca, crua",
	"Kiwi, cru",
	"Laranja, pêra, crua",
	"Maçã, Fuji, com casca, crua",
	"Mamão, Formosa, cru",
	"Mamão, Papaia, cru",
	"Manga, Palmer, crua",
	"Manga, Tommy Atkins, crua",
	"Melancia, crua",
	"Melão, cru",
	"Morango, cru",
	"Pêssego, Aurora, cru",
	"Tangerina, Poncã, crua",
	"Uva, Itália, crua",
	// Cereais, tubérculos e leguminosas
	"Arroz, integral, cozido",
	"Arroz, tipo 1, cozido",
	"Aveia, flocos, crua",
	"Batata, doce, cozida",
	"Batata, inglesa, cozida",
	"Cuscuz, de milho, cozido com sal",
	"Feijão, carioca, cozido",
	"Feijão, preto, cozido",
	"Lentilha, cozida",
	"Mandioca, cozida",
	"Milho, verde, enlatado, drenado",
	"Pão, aveia, forma",
	"Pão, trigo, forma, integral",
	"Pão, trigo, francês",
	"Soja, queijo (tofu)",
	// Oleaginosas
	"Amendoim, torrado, salgado",
	"Castanha-de-caju, torrada, salgada",
	"Castanha-do-Brasil, crua",
	// Carnes, peixes e ovos
	"Carne, bovina, acém, moído, cozido",
	"Carne, bovina, contra-filé, sem gordura, grelhado",
	"Carne, bovina, patinho, sem gordura, grelhado",
	"Frango, peito, sem pele, grelhado",
	"Frango, sobrecoxa, sem pele, assada",
	"Merluza, filé, assado",
	"Ovo, de galinha, clara, cozida/10minutos",
	"Ovo, de galinha, inteiro, cozido/10minutos",
	"Porco, lombo, assado",
	"Salmão, sem pele, fresco, grelhado",
	"Sardinha, assada",
	// Leite e derivados
	"Iogurte, natural",
	"Iogurte, natural, desnatado",
	"Leite, de vaca, desnatado, pó",
	"Leite, de vaca, integral, pó",
	"Leite, de vaca, desnatado, UHT",
	"Leite, de vaca, integral",
	"Queijo, minas, frescal",
	"Queijo, ricota",
];

// Comida de prato (almoço/jantar): não entra como troca em café, lanche ou
// ceia (a IA insistia em "arroz integral no lugar do pão" no café).
export const MAIN_DISH_FOODS = [
	"Arroz, integral, cozido",
	"Arroz, tipo 1, cozido",
	"Feijão, carioca, cozido",
	"Feijão, preto, cozido",
	"Lentilha, cozida",
];

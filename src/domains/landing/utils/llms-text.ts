import { aiQuotaSummary } from "~/domains/landing/utils/ai-copy";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

const CALCULATOR_LINKS = [
	[
		"tmb",
		"TMB e gasto calórico",
		"Mifflin-St Jeor ou Harris-Benedict + método fatorial (rotina, musculação e cardio por MET).",
	],
	[
		"macros",
		"Macros",
		"calorias e g/kg de proteína, carboidrato e gordura pra perder peso, manter ou ganhar massa.",
	],
	[
		"proteina",
		"Proteína por dia",
		"1,6–2,2 g/kg, por refeição e em frango, ovo ou whey.",
	],
	[
		"agua",
		"Água por dia",
		"mínimo (35 ml/kg) e recomendado pra quem treina (40 ml/kg + suor do treino e do calor), em litros e copos.",
	],
	[
		"imc",
		"IMC",
		"índice de massa corporal, faixas da OMS e peso saudável pra altura.",
	],
	[
		"gordura-corporal",
		"Percentual de gordura",
		"estimativa pelo método da Marinha dos EUA (pescoço, cintura e quadril), com massa gorda e magra.",
	],
] as const;

function aiSentence(open: boolean) {
	const features =
		"importar dieta por PDF/foto, receita da refeição, variar refeição, completar o que falta, troca mais em conta, resumo da semana";
	return open
		? `Recursos com IA (${features}) são grátis, com cota mensal por pessoa: ${aiQuotaSummary()}.`
		: `Recursos com IA (${features}) estão em teste fechado e chegam em breve.`;
}

/** Conteúdo do `/llms.txt`, com os links no domínio do site. */
export function llmsText(site: URL, aiOpen: boolean) {
	const url = (path: string) => new URL(path, site).href;
	const calculators = CALCULATOR_LINKS.map(
		([slug, title, text]) =>
			`  - [${title}](${url(`/calculadoras/${slug}`)}): ${text}`,
	);

	return [
		`# ${APP_NAME} · ${APP_TAGLINE}`,
		"",
		`> App web gratuito (pt-BR) para quem treina e conta macros: calcula a TMB e o gasto calórico diário, define a meta (perder peso, manter ou ganhar massa) em g/kg (proteína total ou só animal, configurável) e monta a dieta por refeição, com a tabela TACO (incluindo fibras, com a recomendação diária, e avisos de sódio e ferro) e alimentos próprios. Tem dietas prontas recalculadas pelas metas, opções de alimento ("ou 250 g de mamão"), medidas caseiras, check-in diário das refeições com sequência de dias, lista de compras com custo estimado (e custo de cada troca de alimento), compartilhamento da dieta por link, ajuste da meta pelo peso registrado (considerando a adesão do check-in) com revisões no dia 15 e no dia 30, dicas "Por que isso importa?" nas escolhas da meta e exportação dos dados em JSON. ${aiSentence(aiOpen)} Não substitui nutricionista.`,
		"",
		"## Páginas públicas",
		"",
		`- [Página inicial](${url("/")}): o que o app faz, como funciona e dúvidas frequentes.`,
		`- [Calculadoras](${url("/calculadoras")}): calculadoras grátis e sem cadastro.`,
		...calculators,
		`- [Como calculamos](${url("/como-calculamos")}): fórmulas e referências em linguagem simples.`,
		`- [Entrar](${url("/login")}): login com Google ou com e-mail e senha.`,
		`- [Termos de uso](${url("/termos")}) e [Política de privacidade](${url("/privacidade")}).`,
		"",
		"## Observações",
		"",
		"- As demais páginas exigem login e trazem dados pessoais do usuário; não devem ser acessadas por agentes.",
		"",
	].join("\n");
}

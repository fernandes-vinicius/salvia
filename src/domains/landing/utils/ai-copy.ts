import { AI_MONTHLY_LIMITS } from "~/domains/ai-usage/utils/ai-usage";
import { APP_NAME } from "~/shared/lib/app-config";

// Textos da IA na landing e na FAQ, nos dois momentos: fechada (só o beta
// testa, "em breve") e aberta pra todos com a cota mensal (`AI_OPEN`). A
// cota sai dos limites de verdade, pra nunca prometer outro número.

/** "3 receitas, 3 variações de refeição, …, 4 resumos da semana". */
export function aiQuotaSummary() {
	const m = AI_MONTHLY_LIMITS;
	return [
		`${m.recipe} receitas`,
		`${m["meal-variation"]} variações de refeição`,
		`${m["meal-fill"]} vezes completar o que falta`,
		`${m["cheaper-swap"]} trocas mais em conta`,
		`${m["diet-import"]} leituras de dieta`,
	]
		.join(", ")
		.concat(` e ${m["weekly-summary"]} resumos da semana`);
}

export function aiSectionCopy(open: boolean) {
	if (!open) {
		return {
			nav: "Em breve",
			badge: `Beta · em breve no ${APP_NAME} Pro`,
			title: "Vem aí: a IA que trabalha junto com a sua dieta",
			text: "Estamos testando estes recursos com um grupo pequeno. Ainda não estão liberados: chegam em breve no plano Pro. Enquanto isso, tudo o que você viu acima é grátis.",
			chip: "Em breve",
			footer:
				"Comece agora com o grátis: sua dieta, metas e medidas já estarão prontas quando o Pro chegar.",
		};
	}
	return {
		nav: "IA",
		badge: "Grátis, com cota mensal",
		title: "IA que trabalha junto com a sua dieta",
		text: `Todo mês você tem ${aiQuotaSummary()}, sem pagar nada. A cota volta no dia 1º. A IA sugere, o app faz as contas e você confere antes de usar.`,
		chip: "Com IA",
		footer:
			"Crie sua conta grátis e teste com a sua própria dieta. Sem cartão de crédito.",
	};
}

const AI_FEATURE_LIST =
	"importar a dieta do nutricionista por PDF ou foto, receita da refeição (com receitas salvas e compartilhadas por link), variar a refeição com os mesmos macros, trocar um alimento por outro equivalente mais barato, completar o que falta no dia e um resumo da semana";

export function aiFaqAnswer(open: boolean) {
	if (!open) {
		return `Vai. Estamos testando com um grupo pequeno: ${AI_FEATURE_LIST}. Ainda não estão liberados e vão fazer parte do ${APP_NAME} Pro, que chega em breve.`;
	}
	return `Tem. Dá pra ${AI_FEATURE_LIST}. É grátis, com uma cota por mês que volta no dia 1º: ${aiQuotaSummary()}. A IA pode errar: as quantidades e os macros são calculados pelo app, e você sempre confere antes de salvar.`;
}

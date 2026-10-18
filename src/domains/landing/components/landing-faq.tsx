import { type FaqItem, FaqList } from "~/shared/components/faq-list";
import { APP_NAME } from "~/shared/lib/app-config";

export const FAQ_QUESTIONS: FaqItem[] = [
	{
		question: "É grátis?",
		answer: "Sim. Entra com a conta Google e usa tudo, sem cartão de crédito.",
	},
	{
		question: "Substitui o nutricionista?",
		answer: `Não. O ${APP_NAME} é uma ferramenta pra quem já entende o básico e quer planejar e acompanhar a própria dieta. Se você tem alguma condição de saúde, objetivo competitivo ou dúvida séria, procure um profissional.`,
	},
	{
		question: "Serve pra perder peso e pra ganhar massa?",
		answer:
			"Serve. Você escolhe perder, manter ou ganhar peso, com ritmos prontos ou um ajuste de kcal personalizado.",
	},
	{
		question: "De onde vêm os dados dos alimentos?",
		answer:
			"Da TACO (Tabela Brasileira de Composição de Alimentos, da Unicamp), com 597 alimentos. O que não estiver lá, como o seu whey ou uma marca específica, você cadastra com os valores do rótulo.",
	},
	{
		question: "Por que a proteína é separada em animal e vegetal?",
		answer:
			"Porque é assim que muita gente que treina conta: a meta de proteína é pela animal (mais completa), e a vegetal entra no total sem inflar a conta.",
	},
	{
		question: "Funciona no celular?",
		answer:
			"Funciona no navegador do celular e do computador, com tema claro e escuro. Não precisa instalar nada.",
	},
];

export function LandingFaq() {
	return (
		<section
			id="duvidas"
			className="mx-auto flex w-full max-w-3xl scroll-mt-20 flex-col gap-8 px-4 py-16 sm:px-6 lg:py-24"
		>
			<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
				Dúvidas frequentes
			</h2>
			<FaqList items={FAQ_QUESTIONS} />
		</section>
	);
}

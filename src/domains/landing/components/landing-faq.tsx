import { type FaqItem, FaqList } from "~/shared/components/faq-list";
import { APP_NAME } from "~/shared/lib/app-config";

export const FAQ_QUESTIONS: FaqItem[] = [
	{
		question: "É grátis?",
		answer:
			"Sim. Entra com a conta Google e usa tudo o que está no app hoje, sem cartão de crédito.",
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
		question: "Não sei montar uma dieta. O app ajuda?",
		answer:
			"Ajuda. Tem dietas prontas (uma pra perder peso e outra pra ganhar massa) que já vêm com as quantidades recalculadas pras metas que você definiu. Você visualiza antes, usa com um toque e depois troca o que quiser.",
	},
	{
		question: "E se eu não estiver perdendo (ou ganhando) peso?",
		answer:
			"Registre seu peso uma vez por semana. Com 3 pesagens em 2 semanas, o app compara com o ritmo esperado e, se estiver fora, sugere comer um pouco mais ou menos. No dia 15 e no dia 30 da dieta ele faz uma revisão, e o check-in conta: se a dieta não foi seguida, ele avisa antes de mexer na meta. Nada muda sem você confirmar.",
	},
	{
		question: "Preciso pesar a comida?",
		answer:
			"Não precisa pesar tudo. Os alimentos mais comuns também aparecem em medida caseira (4 colheres de arroz, 1 concha de feijão, 2 fatias de pão), e você pode deixar opções na dieta, como 100 g de banana ou 250 g de mamão.",
	},
	{
		question: "Dá pra saber quanto a dieta custa?",
		answer:
			"Dá. A lista de compras mostra o custo estimado da semana com preços médios de referência, e você troca pelo preço que paga no seu mercado. Ao trocar um alimento, o app também mostra quanto a troca muda no custo por dia.",
	},
	{
		question: "De onde vêm os dados dos alimentos?",
		answer:
			"Da TACO (Tabela Brasileira de Composição de Alimentos, da Unicamp), com 597 alimentos. O que não estiver lá, como o seu whey ou uma marca específica, você cadastra com os valores do rótulo.",
	},
	{
		question: "A proteína vegetal conta?",
		answer:
			"Conta. Por padrão a meta é da proteína total (animal + vegetal), como a maioria dos nutricionistas faz. Se você prefere contar só a animal, é só trocar nas Configurações. O resumo do dia mostra as duas separadas.",
	},
	{
		question: "Vai ter IA no app?",
		answer: `Vai. Estamos testando com um grupo pequeno: importar a dieta do nutricionista por PDF ou foto, receita da refeição (com receitas salvas e compartilhadas por link), variar a refeição com os mesmos macros, completar o que falta no dia e um resumo da semana. Ainda não estão liberados e vão fazer parte do ${APP_NAME} Pro, que chega em breve.`,
	},
	{
		question: "Meus dados ficam comigo?",
		answer:
			"Ficam. Ninguém vê sua dieta nem suas medidas, a não ser que você compartilhe o link. Em Configurações dá pra baixar tudo num arquivo ou excluir a conta com todos os dados.",
	},
	{
		question: "Funciona no celular?",
		answer:
			"Funciona no navegador do celular e do computador, com tema claro e escuro. Se quiser, instala na tela inicial e abre como um app, sem passar por loja.",
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

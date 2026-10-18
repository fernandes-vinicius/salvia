import type { ReactNode } from "react";

import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import {
	SampleCalibration,
	SampleMeasurements,
	SampleShopping,
} from "~/domains/landing/components/sample-screens";
import { SampleSwap } from "~/domains/landing/components/sample-swap";
import { SampleTemplates } from "~/domains/landing/components/sample-templates";
import { ShowcaseFrame } from "~/domains/landing/components/showcase-frame";
import {
	SAMPLE_ENERGY,
	SAMPLE_SUMMARY,
} from "~/domains/landing/utils/sample-data";
import {
	Check,
	FileDown,
	type LucideIcon,
	Salad,
	Smartphone,
	Wheat,
} from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

const EXTRAS: { icon: LucideIcon; title: string; text: string }[] = [
	{
		icon: Wheat,
		title: "TACO + seus alimentos",
		text: "597 alimentos da tabela brasileira e os de rótulo que você cadastrar, como o seu whey.",
	},
	{
		icon: Salad,
		title: "Próxima refeição",
		text: "O início mostra o que comer agora e se o plano do dia fecha com a meta.",
	},
	{
		icon: FileDown,
		title: "Dieta em PDF",
		text: "Modo leitura limpo pra consultar no mercado e exportar pra imprimir.",
	},
	{
		icon: Smartphone,
		title: "Instala no celular",
		text: "Abre da tela inicial, em tela cheia, como um app. Sem loja e sem baixar nada.",
	},
];

export function LandingFeatures() {
	return (
		<section
			id="recursos"
			className="mx-auto flex w-full max-w-6xl scroll-mt-20 flex-col gap-16 px-4 py-16 sm:px-6 lg:gap-24 lg:py-24"
		>
			<div className="flex max-w-2xl flex-col gap-3">
				<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
					Tudo que a sua planilha fazia, e o que ela nunca fez
				</h2>
				<p className="text-pretty text-muted-foreground">
					As telas abaixo são do app de verdade, com o dia de um marombeiro de
					80 kg que quer perder peso.
				</p>
			</div>

			<FeatureRow
				eyebrow="Igual à planilha"
				title="O resumo do dia que você já conhece"
				points={[
					"P(A) · C · G · kcal por alimento e por refeição",
					"Total do dia em gramas, %, kcal e g/kg",
					"Quanto a dieta fica acima ou abaixo do seu gasto, na hora",
				]}
				visual={
					<ShowcaseFrame label="Resumo do dia no app">
						<DietSummaryCard
							summary={SAMPLE_SUMMARY}
							tdee={SAMPLE_ENERGY.tdee}
						/>
					</ShowcaseFrame>
				}
			/>

			<FeatureRow
				reverse
				eyebrow="Troca inteligente"
				title="Trocou o arroz? A conta vem pronta"
				points={[
					"Substitua um alimento e receba a quantidade com o mesmo macro",
					"Copie um item pra outra refeição com um toque",
					"Arraste pra reordenar ou mudar de refeição",
				]}
				visual={
					<ShowcaseFrame label="Substituir e copiar alimento no app">
						<SampleSwap />
					</ShowcaseFrame>
				}
			/>

			<FeatureRow
				eyebrow="Começo rápido"
				title="Não sabe por onde começar? Use uma dieta pronta"
				points={[
					"Modelos pra perder peso, ganhar massa e gastar pouco no mercado",
					"As quantidades são recalculadas pras metas que você definiu",
					"Visualize a dieta inteira antes de usar e ajuste como quiser",
				]}
				visual={
					<ShowcaseFrame label="Dietas prontas no app">
						<SampleTemplates />
					</ShowcaseFrame>
				}
			/>

			<FeatureRow
				reverse
				eyebrow="No mercado"
				title="A lista de compras sai da sua dieta"
				points={[
					"Pra 1 dia, 1 semana ou 1 mês, separada por seção do mercado",
					"Arroz e carnes já no peso cru, ovos e pães em unidades",
					"Marque o que já pegou e mande pro WhatsApp",
				]}
				visual={
					<ShowcaseFrame label="Lista de compras de uma semana no app">
						<SampleShopping />
					</ShowcaseFrame>
				}
			/>

			<FeatureRow
				eyebrow="Evolução"
				title="Veja o emagrecimento acontecendo"
				points={[
					"Peso, cintura, braço e mais 12 medidas",
					"Gráfico com o tempo real entre as medições",
					"Lembrete quando passar um mês sem medir",
				]}
				visual={
					<ShowcaseFrame label="Medidas e gráfico de evolução no app">
						<SampleMeasurements />
					</ShowcaseFrame>
				}
			/>

			<FeatureRow
				reverse
				eyebrow="Meta que se ajusta"
				title="O peso travou? O app percebe e sugere o ajuste"
				points={[
					"Pese-se uma vez por semana e o app compara com o esperado",
					"Sugere comer um pouco mais ou menos, em passos pequenos",
					"Você decide se aplica, e pode desfazer quando quiser",
				]}
				visual={
					<ShowcaseFrame label="Sugestão de ajuste da meta pelo peso no app">
						<SampleCalibration />
					</ShowcaseFrame>
				}
			/>

			<ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
				{EXTRAS.map(({ icon: Icon, title, text }) => (
					<li key={title} className="flex flex-col gap-3">
						<span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
							<Icon className="size-5" aria-hidden />
						</span>
						<h3 className="font-heading font-semibold">{title}</h3>
						<p className="text-pretty text-muted-foreground text-sm">{text}</p>
					</li>
				))}
			</ul>
		</section>
	);
}

function FeatureRow({
	eyebrow,
	title,
	points,
	visual,
	reverse = false,
}: {
	eyebrow: string;
	title: string;
	points: string[];
	visual: ReactNode;
	reverse?: boolean;
}) {
	return (
		<div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
			<div className={cn("flex flex-col gap-4", reverse && "lg:order-last")}>
				<p className="font-medium text-primary text-sm">{eyebrow}</p>
				<h3 className="text-balance font-heading font-semibold text-2xl tracking-tight sm:text-3xl">
					{title}
				</h3>
				<ul className="flex flex-col gap-2.5">
					{points.map((point) => (
						<li key={point} className="flex gap-2.5 text-muted-foreground">
							<Check
								className="mt-1 size-4 shrink-0 text-primary"
								aria-hidden
							/>
							{point}
						</li>
					))}
				</ul>
			</div>
			<div className="mx-auto w-full min-w-0 max-w-lg">{visual}</div>
		</div>
	);
}

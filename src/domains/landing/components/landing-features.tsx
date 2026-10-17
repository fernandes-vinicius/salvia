import {
	ArrowLeftRight,
	Calculator,
	ChartLine,
	FileDown,
	type LucideIcon,
	Salad,
	Target,
} from "~/shared/components/icons";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
	{
		icon: Calculator,
		title: "Gasto calórico de verdade",
		text: "TMB por Mifflin-St Jeor (ou Harris-Benedict), rotina do dia a dia e o seu treino de musculação e cardio entrando na conta.",
	},
	{
		icon: Target,
		title: "Meta em g/kg",
		text: "Cutting, manutenção ou bulking. Proteína animal e gordura em g/kg, carbo no que sobra ou fixado. Avisa se algo ficar fora da curva.",
	},
	{
		icon: Salad,
		title: "Grade igual à planilha",
		text: "Refeições com P(A) · C · G · kcal por alimento, total do dia, % e g/kg, e o planejado contra a meta lado a lado.",
	},
	{
		icon: ArrowLeftRight,
		title: "Troca sem refazer conta",
		text: "Substitua um alimento e o app sugere a quantidade com o mesmo macro. Copie itens entre refeições com um toque.",
	},
	{
		icon: ChartLine,
		title: "Medidas e evolução",
		text: "Peso, cintura, braço e o que mais você mede, com gráfico de evolução e lembrete pra medir de novo.",
	},
	{
		icon: FileDown,
		title: "Dieta em PDF",
		text: "Modo leitura limpo pra consultar no mercado e exportar em PDF pra imprimir ou mandar pra quem quiser.",
	},
];

export function LandingFeatures() {
	return (
		<section
			id="recursos"
			className="mx-auto flex w-full max-w-6xl scroll-mt-20 flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24"
		>
			<div className="flex max-w-2xl flex-col gap-3">
				<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
					Tudo que a sua planilha fazia, e o que ela nunca fez
				</h2>
				<p className="text-pretty text-muted-foreground">
					Com a tabela TACO (597 alimentos) e os seus alimentos de rótulo, como
					o seu whey.
				</p>
			</div>
			<ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map(({ icon: Icon, title, text }) => (
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

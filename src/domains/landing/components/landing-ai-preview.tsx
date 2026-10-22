import Link from "next/link";
import { aiSectionCopy } from "~/domains/landing/utils/ai-copy";
import {
	ArrowRight,
	BookmarkCheck,
	ChefHat,
	FileDown,
	type LucideIcon,
	NotebookPen,
	PiggyBank,
	Shuffle,
	Sparkles,
	Target,
} from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { AI_IS_OPEN } from "~/shared/lib/ai-launch";

const AI_FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
	{
		icon: FileDown,
		title: "Importar a dieta do nutricionista",
		text: "Mande o PDF ou a foto e a dieta aparece montada no app, pra você conferir e salvar.",
	},
	{
		icon: ChefHat,
		title: "Receita da refeição",
		text: "Uma receita com os alimentos e as quantidades da sua refeição, com passo a passo.",
	},
	{
		icon: BookmarkCheck,
		title: "Minhas receitas",
		text: "Guarde as receitas que gostou e mande pelo WhatsApp com um link, com foto e tudo.",
	},
	{
		icon: Shuffle,
		title: "Variar a refeição",
		text: "Enjoou? Outra versão da refeição, com trocas que combinam e os mesmos macros.",
	},
	{
		icon: PiggyBank,
		title: "Troca mais em conta",
		text: "Toque num alimento e veja se tem um equivalente mais barato, com quanto você economiza no mês.",
	},
	{
		icon: Target,
		title: "Completar o que falta",
		text: "Faltou proteína no dia? A IA escolhe o que combina e o app calcula as quantidades.",
	},
	{
		icon: NotebookPen,
		title: "Resumo da semana",
		text: "Um balanço curto do seu peso, das medidas e do check-in, com um próximo passo.",
	},
];

// Recursos com IA. Fechada: o que vem aí, sem data nem preço, deixando claro
// que ainda não estão liberados. Aberta (`AI_OPEN`): grátis com a cota mensal.
export function LandingAiPreview({ open = AI_IS_OPEN }: { open?: boolean }) {
	const copy = aiSectionCopy(open);
	return (
		<section
			id="ia"
			aria-labelledby="ia-titulo"
			className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24"
		>
			<div className="flex flex-col gap-10 rounded-[2rem] bg-card p-6 sm:p-10">
				<div className="flex max-w-2xl flex-col items-start gap-4">
					<Badge variant="secondary">
						<Sparkles data-icon="inline-start" />
						{copy.badge}
					</Badge>
					<h2
						id="ia-titulo"
						className="text-balance font-heading font-semibold text-3xl tracking-tight"
					>
						{copy.title}
					</h2>
					<p className="text-pretty text-muted-foreground">{copy.text}</p>
				</div>

				<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{AI_FEATURES.map(({ icon: Icon, title, text }) => (
						<li
							key={title}
							className="flex flex-col gap-3 rounded-3xl bg-secondary p-5 text-secondary-foreground"
						>
							<div className="flex items-center justify-between gap-3">
								<span className="flex size-10 items-center justify-center rounded-full bg-card text-primary">
									<Icon className="size-5" aria-hidden />
								</span>
								<span className="rounded-full bg-card px-2.5 py-0.5 font-medium text-xs">
									{copy.chip}
								</span>
							</div>
							<h3 className="font-heading font-semibold">{title}</h3>
							<p className="text-pretty text-sm leading-relaxed">{text}</p>
						</li>
					))}
				</ul>

				<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-pretty text-muted-foreground text-sm">
						{copy.footer}
					</p>
					<Button
						className="shrink-0"
						nativeButton={false}
						render={<Link href="/login" />}
					>
						Criar conta grátis
						<ArrowRight data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</section>
	);
}

import Link from "next/link";

import { DietPreview } from "~/domains/diet/components/diet-preview";
import { ShowcaseFrame } from "~/domains/landing/components/showcase-frame";
import { SAMPLE_MEALS } from "~/domains/landing/utils/sample-data";
import { ArrowLeftRight, ArrowRight, Check } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";

const PERKS = ["Grátis", "Entra com Google", "Sem cartão"];

export function LandingHero() {
	const lunch = SAMPLE_MEALS.filter((meal) => meal.id === "almoco");

	return (
		<section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
			<div className="flex flex-col items-start gap-6">
				<Badge variant="secondary">Pra quem conta macro</Badge>
				<h1 className="text-balance font-heading font-semibold text-4xl leading-[1.1] tracking-tight sm:text-5xl">
					Sua dieta de maromba, sem planilha e sem papel.
				</h1>
				<p className="max-w-xl text-pretty text-lg text-muted-foreground">
					Calcule seu gasto, defina a meta em g/kg e monte as refeições batendo
					proteína, carbo e gordura, com a tabela TACO na mão. Do jeito que você
					já faz, só que sem conta de cabeça.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						nativeButton={false}
						render={<Link href="/login" />}
					>
						Montar minha dieta
						<ArrowRight data-icon="inline-end" />
					</Button>
					<Button
						size="lg"
						variant="ghost"
						nativeButton={false}
						render={<Link href="#como-funciona" />}
					>
						Ver como funciona
					</Button>
				</div>
				<ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-sm">
					{PERKS.map((perk) => (
						<li key={perk} className="flex items-center gap-1.5">
							<Check className="size-4 text-primary" aria-hidden />
							{perk}
						</li>
					))}
				</ul>
			</div>

			{/* A tela de verdade (componentes do app) com o dia de exemplo. */}
			<ShowcaseFrame label="Exemplo de refeição no app">
				<DietPreview meals={lunch} />
				<div className="flex items-center gap-3 rounded-3xl bg-card p-4 text-sm">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
						<ArrowLeftRight className="size-4" />
					</span>
					<p className="text-pretty">
						<span className="font-medium">
							Arroz 150 g → Batata-doce 230 g.
						</span>{" "}
						<span className="text-muted-foreground">
							Troca com os mesmos 42 g de carboidrato, calculada pra você.
						</span>
					</p>
				</div>
			</ShowcaseFrame>
		</section>
	);
}

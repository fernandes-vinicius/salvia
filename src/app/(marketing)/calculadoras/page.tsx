import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorCta } from "~/domains/calculators/components/calculator-cta";
import { CALCULATORS } from "~/domains/calculators/data/calculators";
import { ArrowRight } from "~/shared/components/icons";

export const metadata: Metadata = {
	title: "Calculadoras de dieta grátis: TMB, macros e proteína",
	description:
		"Calculadoras grátis pra quem treina: taxa metabólica basal e gasto calórico, macros pra perder peso ou ganhar massa e proteína por dia. Sem cadastro.",
	alternates: { canonical: "/calculadoras" },
};

export default function CalculatorsPage() {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-16">
			<header className="flex max-w-2xl flex-col gap-3">
				<h1 className="text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
					Calculadoras de dieta
				</h1>
				<p className="text-pretty text-muted-foreground">
					Grátis e sem cadastro, com as mesmas contas do app. O que você digita
					fica só no seu navegador.
				</p>
			</header>

			<ul className="grid gap-4 md:grid-cols-3">
				{CALCULATORS.map((calculator) => (
					<li key={calculator.href}>
						<Link
							href={calculator.href}
							className="group flex h-full flex-col gap-3 rounded-3xl bg-card p-5 outline-none transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 md:p-6"
						>
							<span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-card">
								<calculator.icon className="size-5" aria-hidden />
							</span>
							<h2 className="font-heading font-semibold text-lg">
								{calculator.title}
							</h2>
							<p className="text-pretty text-muted-foreground text-sm">
								{calculator.description}
							</p>
							<span className="mt-auto flex items-center gap-1.5 font-medium text-primary text-sm">
								Calcular
								<ArrowRight
									className="size-4 transition-transform group-hover:translate-x-0.5"
									aria-hidden
								/>
							</span>
						</Link>
					</li>
				))}
			</ul>

			<CalculatorCta
				title="Quer tudo isso numa dieta de verdade?"
				description="No app, as calculadoras viram um plano: você monta as refeições com a tabela TACO e vê quanto falta de cada macro. Grátis, entrando com a conta Google."
			/>
		</main>
	);
}

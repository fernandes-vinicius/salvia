import type { Metadata } from "next";
import { CalculatorCards } from "~/domains/calculators/components/calculator-cards";
import { CalculatorCta } from "~/domains/calculators/components/calculator-cta";

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

			<CalculatorCards />

			<CalculatorCta
				title="Quer tudo isso numa dieta de verdade?"
				description="No app, as calculadoras viram um plano: você monta as refeições com a tabela TACO e vê quanto falta de cada macro. Grátis, entrando com a conta Google."
			/>
		</main>
	);
}

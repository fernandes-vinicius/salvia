import { CalculatorCards } from "~/domains/calculators/components/calculator-cards";

// Atalho pras calculadoras públicas: dá pra testar as contas antes de criar
// conta (e ajuda a busca a achar essas páginas).
export function LandingCalculators() {
	return (
		<section
			aria-labelledby="calculadoras"
			className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-16 sm:px-6 lg:pt-24"
		>
			<div className="flex max-w-2xl flex-col gap-3">
				<h2
					id="calculadoras"
					className="text-balance font-heading font-semibold text-3xl tracking-tight"
				>
					Quer testar as contas antes?
				</h2>
				<p className="text-pretty text-muted-foreground">
					As calculadoras são grátis e não pedem cadastro. Se gostar, os números
					vão junto quando você entrar.
				</p>
			</div>
			<CalculatorCards heading="h3" />
		</section>
	);
}

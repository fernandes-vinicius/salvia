import Link from "next/link";

import { ArrowRight } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

// Fecho de cada calculadora: os números já calculados viram a dieta no app.
export function CalculatorCta({
	title = "Agora transforme esses números em refeições",
	description = "Entre grátis com a conta Google: os valores daqui já vão junto, e você monta a dieta batendo proteína, carboidrato e gordura com a tabela TACO.",
}: {
	title?: string;
	description?: string;
}) {
	return (
		<aside className="flex flex-col items-start gap-4 rounded-3xl bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
			<div className="flex flex-col gap-1">
				<p className="font-heading font-semibold text-lg">{title}</p>
				<p className="max-w-xl text-pretty text-muted-foreground text-sm">
					{description}
				</p>
			</div>
			<Button
				size="lg"
				className="shrink-0"
				nativeButton={false}
				render={<Link href="/login" />}
			>
				Montar minha dieta
				<ArrowRight data-icon="inline-end" />
			</Button>
		</aside>
	);
}

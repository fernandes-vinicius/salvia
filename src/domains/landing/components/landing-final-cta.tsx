import Link from "next/link";

import { ArrowRight } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

export function LandingFinalCta() {
	return (
		<section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
			<div className="flex flex-col items-center gap-6 rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground">
				<h2 className="max-w-2xl text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
					Bora tirar a dieta do papel?
				</h2>
				<p className="max-w-xl text-pretty text-primary-foreground/80">
					Em 5 minutos você tem o gasto calculado, a meta definida e a primeira
					refeição montada.
				</p>
				<Button
					size="lg"
					variant="secondary"
					nativeButton={false}
					render={<Link href="/login" />}
				>
					Começar grátis
					<ArrowRight data-icon="inline-end" />
				</Button>
			</div>
		</section>
	);
}

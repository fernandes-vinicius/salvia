import Link from "next/link";

import { CALCULATORS } from "~/domains/calculators/data/calculators";
import { ArrowRight } from "~/shared/components/icons";

// Cards das calculadoras públicas (página /calculadoras e landing).
// `heading` acompanha o nível do título da seção onde entram.
export function CalculatorCards({ heading = "h2" }: { heading?: "h2" | "h3" }) {
	const Heading = heading;
	return (
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
						<Heading className="font-heading font-semibold text-lg">
							{calculator.title}
						</Heading>
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
	);
}

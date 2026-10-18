import Link from "next/link";
import type { ReactNode } from "react";

import { CalculatorCta } from "~/domains/calculators/components/calculator-cta";
import {
	type FaqItem,
	FaqList,
	faqStructuredData,
} from "~/shared/components/faq-list";
import { ChevronRight } from "~/shared/components/icons";
import { StructuredData } from "~/shared/components/structured-data";
import { APP_NAME, SITE_URL } from "~/shared/lib/app-config";

interface CalculatorPageProps {
	/** Caminho da página (ex.: "/calculadoras/tmb"), pro breadcrumb e JSON-LD. */
	path: string;
	/** Nome curto no breadcrumb. */
	name: string;
	title: string;
	intro: ReactNode;
	/** Descrição pro JSON-LD (a mesma do metadata). */
	description: string;
	calculator: ReactNode;
	/** Texto explicativo abaixo da calculadora (como é calculado etc.). */
	children: ReactNode;
	faq: FaqItem[];
}

// Estrutura comum das calculadoras públicas: breadcrumb, título, a
// calculadora, convite pro app, explicação e dúvidas (com JSON-LD).
export function CalculatorPage({
	path,
	name,
	title,
	intro,
	description,
	calculator,
	children,
	faq,
}: CalculatorPageProps) {
	const url = new URL(path, SITE_URL).href;

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:py-12">
			<header className="flex flex-col gap-3">
				<nav aria-label="Você está em">
					<ol className="flex items-center gap-1.5 text-muted-foreground text-sm">
						<li>
							<Link
								href="/calculadoras"
								className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								Calculadoras
							</Link>
						</li>
						<li aria-hidden>
							<ChevronRight className="size-3.5" />
						</li>
						<li aria-current="page" className="text-foreground">
							{name}
						</li>
					</ol>
				</nav>
				<h1 className="max-w-3xl text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
					{title}
				</h1>
				<div className="max-w-2xl text-pretty text-muted-foreground">
					{intro}
				</div>
			</header>

			{calculator}

			<CalculatorCta />

			<div className="grid gap-12 lg:grid-cols-2">
				<article className="flex flex-col gap-4 text-pretty leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:tracking-tight [&_h3]:pt-2 [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-lg [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
					{children}
				</article>
				<section aria-labelledby="duvidas" className="flex flex-col gap-4">
					<h2
						id="duvidas"
						className="font-heading font-semibold text-2xl tracking-tight"
					>
						Dúvidas frequentes
					</h2>
					<FaqList items={faq} />
				</section>
			</div>

			<StructuredData
				data={{
					"@context": "https://schema.org",
					"@graph": [
						{
							"@type": "WebApplication",
							name: `${title} · ${APP_NAME}`,
							url,
							description,
							applicationCategory: "HealthApplication",
							operatingSystem: "Web",
							inLanguage: "pt-BR",
							isAccessibleForFree: true,
							offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
						},
						{
							"@type": "BreadcrumbList",
							itemListElement: [
								{
									"@type": "ListItem",
									position: 1,
									name: "Calculadoras",
									item: new URL("/calculadoras", SITE_URL).href,
								},
								{ "@type": "ListItem", position: 2, name, item: url },
							],
						},
						faqStructuredData(faq),
					],
				}}
			/>
		</main>
	);
}

import type { ReactNode } from "react";

import { LEGAL_UPDATED_AT } from "~/shared/lib/app-config";

// Página de texto jurídico (termos, privacidade): coluna de leitura,
// seções numeradas pelo próprio título e data da última revisão.
export function LegalDocument({
	title,
	intro,
	children,
}: {
	title: string;
	intro: ReactNode;
	children: ReactNode;
}) {
	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-16">
			<header className="flex flex-col gap-3">
				<h1 className="text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
					{title}
				</h1>
				<p className="text-muted-foreground text-sm">
					Última atualização: {LEGAL_UPDATED_AT}
				</p>
				<div className="text-pretty text-muted-foreground">{intro}</div>
			</header>
			<div className="flex flex-col gap-8">{children}</div>
		</main>
	);
}

export function LegalSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3 text-pretty leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
			<h2 className="font-heading font-semibold text-xl">{title}</h2>
			{children}
		</section>
	);
}

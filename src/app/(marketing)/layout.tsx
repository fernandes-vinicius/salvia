import Link from "next/link";

import { ClarityScript } from "~/shared/components/clarity-script";
import { Logo } from "~/shared/components/logo";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { SkipLink } from "~/shared/components/skip-link";
import { Button } from "~/shared/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

// Âncoras com `/` na frente: o layout também serve calculadoras e páginas
// legais, de onde o link precisa voltar pra landing.
const NAV = [
	{ href: "/#recursos", label: "Recursos" },
	{ href: "/#como-funciona", label: "Como funciona" },
	{ href: "/calculadoras", label: "Calculadoras" },
	{ href: "/#duvidas", label: "Dúvidas" },
] as const;

const FOOTER_LINKS = [
	{ href: "/calculadoras", label: "Calculadoras" },
	{ href: "/termos", label: "Termos de uso" },
	{ href: "/privacidade", label: "Privacidade" },
] as const;

// Páginas públicas (landing, calculadoras, termos): sem barra de abas.
export default function MarketingLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="flex min-h-svh flex-col">
			<SkipLink />
			<header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<Link
						href="/"
						aria-label={`${APP_NAME} — página inicial`}
						className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Logo />
					</Link>
					<nav aria-label="Principal" className="hidden md:block">
						<ul className="flex items-center gap-1">
							{NAV.map((item) => (
								<li key={item.href}>
									<Button
										variant="ghost"
										size="sm"
										nativeButton={false}
										render={<Link href={item.href} />}
									>
										{item.label}
									</Button>
								</li>
							))}
						</ul>
					</nav>
					<div className="flex items-center gap-2">
						<ModeToggle />
						<Button nativeButton={false} render={<Link href="/login" />}>
							Entrar
						</Button>
					</div>
				</div>
			</header>

			<div id="conteudo" className="flex flex-1 flex-col">
				{children}
			</div>
			<ClarityScript />

			<footer className="border-border border-t">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-muted-foreground text-sm sm:px-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p>
							<span className="font-heading font-semibold text-foreground">
								{APP_NAME}
							</span>{" "}
							· {APP_TAGLINE}
						</p>
						<nav aria-label="Rodapé">
							<ul className="flex flex-wrap gap-x-5 gap-y-2">
								{FOOTER_LINKS.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
					<p className="text-xs">
						Ferramenta de cálculo e planejamento. Não faz prescrição dietética e
						não substitui acompanhamento de nutricionista ou médico.
					</p>
				</div>
			</footer>
		</div>
	);
}

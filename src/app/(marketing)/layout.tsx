import Link from "next/link";

import { Logo } from "~/shared/components/logo";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { SkipLink } from "~/shared/components/skip-link";
import { Button } from "~/shared/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

const NAV = [
	{ href: "#recursos", label: "Recursos" },
	{ href: "#como-funciona", label: "Como funciona" },
	{ href: "#duvidas", label: "Dúvidas" },
] as const;

// Páginas públicas (landing): sem sessão, sem barra de abas.
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
					<nav aria-label="Seções" className="hidden md:block">
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

			<footer className="border-border border-t">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<p>
						<span className="font-heading font-semibold text-foreground">
							{APP_NAME}
						</span>{" "}
						· {APP_TAGLINE}
					</p>
					<p className="text-xs">
						Ferramenta de planejamento. Não substitui acompanhamento de
						nutricionista ou médico.
					</p>
				</div>
			</footer>
		</div>
	);
}

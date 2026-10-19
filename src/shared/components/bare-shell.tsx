import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "~/shared/components/logo";
import { SkipLink } from "~/shared/components/skip-link";
import { APP_NAME } from "~/shared/lib/app-config";

// Moldura mínima (logo + conteúdo) pras telas que renderizam direto no
// layout raiz, fora dos grupos com cabeçalho: 404 geral e erro geral.
export function BareShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-svh flex-col">
			<SkipLink />
			<header className="mx-auto flex w-full max-w-3xl px-4 pt-6 sm:px-6">
				<Link
					href="/"
					aria-label={`Início — ${APP_NAME}`}
					className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					<Logo />
				</Link>
			</header>
			<main
				id="conteudo"
				className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6"
			>
				{children}
			</main>
		</div>
	);
}

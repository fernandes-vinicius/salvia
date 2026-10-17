import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { UserMenu } from "~/domains/auth";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { ShellProviders } from "~/providers/shell-providers";
import { Settings } from "~/shared/components/icons";
import { Logo } from "~/shared/components/logo";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { TabBar, TabBarFallback } from "~/shared/components/navigation/tab-bar";
import { InstallPrompt } from "~/shared/components/pwa/install-prompt";
import { SkipLink } from "~/shared/components/skip-link";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_NAME } from "~/shared/lib/app-config";

// Área logada: dados pessoais, fora dos buscadores.
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
	return (
		<ShellProviders>
			<div className="group/app flex min-h-svh flex-col">
				<SkipLink />
				{/* Acompanha páginas largas (`data-wide-page`) via CSS, sem usePathname. */}
				<header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6 group-has-[[data-wide-page]]/app:max-w-[87rem] sm:px-6 print:hidden">
					<Link
						href="/dashboard"
						aria-label={`Início — ${APP_NAME}`}
						className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Logo />
					</Link>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Configurações"
							nativeButton={false}
							render={<Link href="/configuracoes" />}
						>
							<Settings />
						</Button>
						<ModeToggle />
						{/* Sessão é dado de request: fica atrás do Suspense pra não
						    segurar o shell estático (Cache Components). */}
						<Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
							<CurrentUserMenu />
						</Suspense>
					</div>
				</header>
				{/* Espaço no fim pra barra de abas flutuante não cobrir conteúdo. */}
				<div
					id="conteudo"
					className="flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+6rem)] print:pb-0"
				>
					{children}
				</div>
				<InstallPrompt />
				<Suspense fallback={<TabBarFallback />}>
					<TabBar />
				</Suspense>
			</div>
		</ShellProviders>
	);
}

async function CurrentUserMenu() {
	const user = await getCurrentUser();
	return <UserMenu user={user} />;
}

import { Suspense } from "react";

import { UserMenu } from "~/domains/auth";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { Logo } from "~/shared/components/logo";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { TabBar, TabBarFallback } from "~/shared/components/navigation/tab-bar";
import { Skeleton } from "~/shared/components/ui/skeleton";

export default function AppLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="flex min-h-svh flex-col">
			<header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6 sm:px-6">
				<Logo />
				<div className="flex items-center gap-2">
					<ModeToggle />
					{/* Sessão é dado de request: fica atrás do Suspense pra não
					    segurar o shell estático (Cache Components). */}
					<Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
						<CurrentUserMenu />
					</Suspense>
				</div>
			</header>
			{/* Espaço no fim pra barra de abas flutuante não cobrir conteúdo. */}
			<div className="flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+6rem)]">
				{children}
			</div>
			<Suspense fallback={<TabBarFallback />}>
				<TabBar />
			</Suspense>
		</div>
	);
}

async function CurrentUserMenu() {
	const user = await getCurrentUser();
	return <UserMenu user={user} />;
}

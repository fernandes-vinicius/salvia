import type { Metadata } from "next";

import { WifiOff } from "~/shared/components/icons";
import { Card, CardContent } from "~/shared/components/ui/card";
import { APP_NAME } from "~/shared/lib/app-config";

export const metadata: Metadata = { title: "Sem conexão" };

// Mostrada pelo service worker quando uma página é aberta sem internet.
// Estática e sem dados do usuário (fica pré-cacheada no aparelho).
export default function OfflinePage() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
			<Card className="w-full max-w-sm ring-0">
				<CardContent className="flex flex-col items-center gap-4 py-4 text-center">
					<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
						<WifiOff className="size-6" />
					</span>
					<div className="flex flex-col gap-1.5">
						<h1 className="font-heading font-semibold text-xl">
							Você está sem internet
						</h1>
						<p className="text-balance text-muted-foreground text-sm">
							O {APP_NAME} precisa de conexão pra carregar sua dieta. Assim que
							a internet voltar, a página recarrega sozinha.
						</p>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

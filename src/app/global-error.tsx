"use client";

import { ErrorScreen } from "~/shared/components/error-screen";
import { APP_NAME } from "~/shared/lib/app-config";

import "./globals.css";

// Último recurso: o próprio layout raiz quebrou. Substitui o documento
// inteiro (precisa de <html>/<body>), sem fontes nem tema do app.
export default function GlobalError({
	error,
	retry,
}: {
	error: unknown;
	retry: () => void;
}) {
	return (
		<html lang="pt-BR">
			<body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
				<title>{`Algo deu errado — ${APP_NAME}`}</title>
				<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
					<ErrorScreen
						error={error}
						retry={retry}
						homeHref="/"
						signedIn={false}
					/>
				</main>
			</body>
		</html>
	);
}

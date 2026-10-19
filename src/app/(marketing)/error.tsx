"use client";

import { ErrorScreen } from "~/shared/components/error-screen";

// Erro inesperado nas páginas públicas (landing, calculadoras, link
// compartilhado): mantém o cabeçalho e o rodapé do site.
export default function MarketingError({
	error,
	retry,
}: {
	error: unknown;
	retry: () => void;
}) {
	return (
		<main className="container-wrapper flex flex-1 flex-col">
			<ErrorScreen error={error} retry={retry} homeHref="/" signedIn={false} />
		</main>
	);
}

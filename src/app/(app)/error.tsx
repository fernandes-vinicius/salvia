"use client";

import { ErrorScreen } from "~/shared/components/error-screen";

// Erro inesperado numa página logada: o cabeçalho e as abas continuam.
export default function AppError({
	error,
	retry,
}: {
	error: unknown;
	retry: () => void;
}) {
	return (
		<main className="container-wrapper flex flex-1 flex-col">
			<ErrorScreen error={error} retry={retry} homeHref="/dashboard" />
		</main>
	);
}

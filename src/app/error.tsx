"use client";

import { BareShell } from "~/shared/components/bare-shell";
import { ErrorScreen } from "~/shared/components/error-screen";

// Erro nas rotas sem boundary próprio (login, design system…).
export default function RootError({
	error,
	retry,
}: {
	error: unknown;
	retry: () => void;
}) {
	return (
		<BareShell>
			<ErrorScreen error={error} retry={retry} homeHref="/" signedIn={false} />
		</BareShell>
	);
}

"use client";

import { useQueryState } from "nuqs";

import { TriangleAlertIcon } from "~/shared/components/icons";
import { Alert, AlertDescription } from "~/shared/components/ui/alert";

// O Better Auth redireciona pro `errorCallbackURL` com `?error=<código>`
// quando o OAuth falha (ex.: usuário cancelou o consentimento).
export function LoginErrorAlert() {
	const [error] = useQueryState("error");

	if (!error) return null;

	return (
		<Alert variant="destructive">
			<TriangleAlertIcon />
			<AlertDescription>
				Não foi possível entrar com o Google. Tente novamente.
			</AlertDescription>
		</Alert>
	);
}

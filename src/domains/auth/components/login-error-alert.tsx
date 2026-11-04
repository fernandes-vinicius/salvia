"use client";

import { useQueryState } from "nuqs";

import { AuthFormError } from "~/domains/auth/components/auth-form-error";
import { authErrorMessage } from "~/domains/auth/utils/auth-errors";

// O Better Auth volta pro login com `?error=<código>` quando o Google falha
// (ex.: cancelou) ou o link de confirmação do e-mail venceu.
export function LoginErrorAlert() {
	const [error] = useQueryState("error");

	if (!error) return null;

	return <AuthFormError message={authErrorMessage({ code: error })} />;
}

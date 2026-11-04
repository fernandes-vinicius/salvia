"use client";

import { useQueryState } from "nuqs";

import { ResetPasswordForm } from "~/domains/auth/components/reset-password-form";

// O link do e-mail passa pelo Better Auth, que volta pra cá com `?token=`
// (ou `?error=INVALID_TOKEN` se venceu).
export function ResetPasswordFromLink() {
	const [token] = useQueryState("token");
	return <ResetPasswordForm token={token} />;
}

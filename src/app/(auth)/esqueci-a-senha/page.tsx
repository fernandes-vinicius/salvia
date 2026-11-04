import type { Metadata } from "next";

import { AuthCard, AuthFooterLink, ForgotPasswordForm } from "~/domains/auth";

export const metadata: Metadata = {
	title: "Esqueci a senha",
	robots: { index: false },
};

export default function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Esqueci a senha"
			description={
				<p className="text-balance text-muted-foreground text-sm">
					Digite o e-mail da conta e mandamos um link pra criar uma nova senha.
					Também serve pra quem entra com Google e quer usar senha.
				</p>
			}
		>
			<div className="flex w-full flex-col gap-4">
				<ForgotPasswordForm />
				<AuthFooterLink text="Lembrou?" href="/login" label="Entrar" />
			</div>
		</AuthCard>
	);
}

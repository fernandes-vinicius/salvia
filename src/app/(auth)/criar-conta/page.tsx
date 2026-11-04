import type { Metadata } from "next";
import Link from "next/link";

import {
	AuthCard,
	AuthFooterLink,
	RedirectIfAuthenticated,
	SignUpForm,
	TermsNotice,
} from "~/domains/auth";

export const metadata: Metadata = {
	title: "Criar conta",
	description:
		"Crie sua conta com e-mail e senha pra montar sua dieta e acompanhar calorias e macros.",
	alternates: { canonical: "/criar-conta" },
};

export default function SignUpPage() {
	return (
		<AuthCard
			title="Criar conta"
			description={
				<p className="text-balance text-muted-foreground text-sm">
					Com e-mail e senha. Tem conta Google? Dá pra{" "}
					<Link
						href="/login"
						className="font-medium text-foreground underline underline-offset-4"
					>
						entrar com ela
					</Link>
					.
				</p>
			}
		>
			<div className="flex w-full flex-col gap-4">
				<SignUpForm />
				<AuthFooterLink text="Já tem conta?" href="/login" label="Entrar" />
			</div>
			<TermsNotice action="Ao criar a conta" />
			<RedirectIfAuthenticated />
		</AuthCard>
	);
}

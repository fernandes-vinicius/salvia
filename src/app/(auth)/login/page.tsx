import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
	AuthCard,
	AuthFooterLink,
	EmailSignInForm,
	GoogleSignInButton,
	LoginErrorAlert,
	RedirectIfAuthenticated,
	TermsNotice,
} from "~/domains/auth";
import { ArrowRight, Calculator } from "~/shared/components/icons";
import { FieldSeparator } from "~/shared/components/ui/field";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: "Entrar",
	description:
		"Entre com Google ou e-mail pra montar sua dieta e acompanhar calorias e macros.",
	alternates: { canonical: "/login" },
};

export default function LoginPage() {
	return (
		<AuthCard
			title={APP_NAME}
			description={
				<>
					<p className="text-balance text-muted-foreground text-sm">
						{APP_TAGLINE}
					</p>
					<p className="mt-1 text-balance text-muted-foreground text-sm">
						Monte sua dieta e acompanhe calorias e macros: proteína, carboidrato
						e gordura.
					</p>
				</>
			}
		>
			<div className="flex w-full flex-col gap-4">
				<Suspense>
					<LoginErrorAlert />
				</Suspense>
				<GoogleSignInButton />
				{/* Fundo do separador = card (o padrão é o da página). */}
				<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
					ou com e-mail
				</FieldSeparator>
				<EmailSignInForm />
				<AuthFooterLink
					text="Ainda não tem conta?"
					href="/criar-conta"
					label="Criar conta"
				/>
			</div>

			<TermsNotice action="Ao entrar" />

			{/* Pra quem ainda não quer criar conta: as calculadoras são públicas. */}
			<Link
				href="/calculadoras"
				className="group flex w-full items-center gap-3 rounded-2xl bg-secondary p-3 text-left outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
					<Calculator className="size-4" aria-hidden />
				</span>
				<span className="flex min-w-0 flex-1 flex-col">
					<span className="font-medium text-sm">Só quer fazer as contas?</span>
					<span className="text-pretty text-muted-foreground text-xs">
						Gasto, macros, proteína, IMC e gordura corporal, sem cadastro.
					</span>
				</span>
				<ArrowRight
					className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
					aria-hidden
				/>
			</Link>
			<RedirectIfAuthenticated />
		</AuthCard>
	);
}

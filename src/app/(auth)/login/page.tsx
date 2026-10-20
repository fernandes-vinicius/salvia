import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
	GoogleSignInButton,
	LoginErrorAlert,
	RedirectIfAuthenticated,
} from "~/domains/auth";
import { ArrowRight, Calculator, Leaf } from "~/shared/components/icons";
import { Card, CardContent } from "~/shared/components/ui/card";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: "Entrar",
	description:
		"Entre com sua conta Google pra montar sua dieta e acompanhar calorias e macros.",
	alternates: { canonical: "/login" },
};

export default function LoginPage() {
	return (
		<Card className="w-full max-w-sm ring-0">
			<CardContent className="flex flex-col items-center gap-8 py-4 text-center">
				<div className="flex flex-col items-center gap-4">
					<span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
						<Leaf className="size-6" />
					</span>
					<div className="flex flex-col gap-1.5">
						<h1 className="font-heading font-semibold text-2xl">{APP_NAME}</h1>
						<p className="text-balance text-muted-foreground text-sm">
							{APP_TAGLINE}
						</p>
						<p className="mt-1 text-balance text-muted-foreground text-sm">
							Monte sua dieta e acompanhe calorias e macros: proteína,
							carboidrato e gordura.
						</p>
					</div>
				</div>

				<div className="flex w-full flex-col gap-3">
					<Suspense>
						<LoginErrorAlert />
					</Suspense>
					<GoogleSignInButton />
				</div>

				<p className="text-balance text-muted-foreground text-xs leading-relaxed [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
					Ao entrar, você concorda com os{" "}
					<Link href="/termos">Termos de uso</Link> e com a{" "}
					<Link href="/privacidade">Política de privacidade</Link>, incluindo o
					uso dos seus dados de corpo e dieta pra calcular o seu plano. O{" "}
					{APP_NAME} não substitui nutricionista.
				</p>

				{/* Pra quem ainda não quer criar conta: as calculadoras são públicas. */}
				<Link
					href="/calculadoras"
					className="group flex w-full items-center gap-3 rounded-2xl bg-secondary p-3 text-left outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
						<Calculator className="size-4" aria-hidden />
					</span>
					<span className="flex min-w-0 flex-1 flex-col">
						<span className="font-medium text-sm">
							Só quer fazer as contas?
						</span>
						<span className="text-pretty text-muted-foreground text-xs">
							Gasto, macros, proteína, IMC e gordura corporal, sem cadastro.
						</span>
					</span>
					<ArrowRight
						className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Link>
			</CardContent>
			<RedirectIfAuthenticated />
		</Card>
	);
}

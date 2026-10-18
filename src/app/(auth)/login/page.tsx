import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
	GoogleSignInButton,
	LoginErrorAlert,
	RedirectIfAuthenticated,
} from "~/domains/auth";
import { Leaf } from "~/shared/components/icons";
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
			</CardContent>
			<RedirectIfAuthenticated />
		</Card>
	);
}

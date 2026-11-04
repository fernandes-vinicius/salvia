import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard, AuthFooterLink } from "~/domains/auth";
import { ResetPasswordFromLink } from "~/domains/auth/components/reset-password-from-link";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Nova senha",
	robots: { index: false },
};

export default function ResetPasswordPage() {
	return (
		<AuthCard
			title="Nova senha"
			description={
				<p className="text-balance text-muted-foreground text-sm">
					Escolha a senha que você vai usar pra entrar.
				</p>
			}
		>
			<div className="flex w-full flex-col gap-4">
				<Suspense fallback={<Skeleton className="h-36 rounded-3xl" />}>
					<ResetPasswordFromLink />
				</Suspense>
				<AuthFooterLink text="Lembrou?" href="/login" label="Entrar" />
			</div>
		</AuthCard>
	);
}

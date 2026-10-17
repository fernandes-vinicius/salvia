"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "~/domains/auth/lib/auth-client";

// Tira da tela de login quem já tem sessão válida. Fica no client (e não no
// proxy) de propósito: o proxy só enxerga o cookie, e um cookie de sessão
// expirada geraria loop `/login` → `/dashboard` → `/login`.
export function RedirectIfAuthenticated() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (session) router.replace("/dashboard");
	}, [session, router]);

	return null;
}

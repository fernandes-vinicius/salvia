import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "~/domains/auth/lib/auth";
import type { User } from "~/domains/auth/types/user-types";

// Data Access Layer: checagem real de sessão (contra o banco). O `proxy.ts`
// só olha se o cookie existe; toda página/ação que toca dados do usuário
// passa por aqui. Lê `headers()`, então com Cache Components o componente
// que chama precisa estar dentro de um `<Suspense>`.
export const getCurrentUser = cache(async (): Promise<User> => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/login");
	}

	const { id, name, email, image } = session.user;
	return { id, name, email, image: image ?? null };
});

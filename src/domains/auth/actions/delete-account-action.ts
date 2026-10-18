"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "~/domains/auth/lib/auth";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { db } from "~/shared/db";
import { user as userTable } from "~/shared/db/schema";

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

// Exclusão da conta (direito da LGPD): encerra a sessão (limpa o cookie via
// `nextCookies`) e apaga o usuário. Perfil, metas, dieta, alimentos, medidas,
// sessões e o vínculo com o Google saem junto pelo `onDelete: cascade`.
export async function deleteAccountAction(): Promise<DeleteAccountResult> {
	const user = await getCurrentUser();

	try {
		await auth.api.signOut({ headers: await headers() });
		await db.delete(userTable).where(eq(userTable.id, user.id));
		return { ok: true };
	} catch {
		return {
			ok: false,
			error: "Não foi possível excluir a conta. Tente de novo.",
		};
	}
}

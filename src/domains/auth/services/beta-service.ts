import "server-only";

import type { User } from "~/domains/auth/types/user-types";
import { hasAiAccess, isBetaEmail } from "~/shared/lib/beta";
import { getEnv } from "~/shared/lib/env";

/** Está em `BETA_EMAILS` (o beta não tem cota mensal de IA). */
export function isBetaUser(user: Pick<User, "email">) {
	return isBetaEmail(user.email, getEnv().BETA_EMAILS);
}

/** Pode usar os recursos de IA (`AI_OPEN` ligado ou e-mail do beta). */
export function canUseAi(user: Pick<User, "email">) {
	const env = getEnv();
	return hasAiAccess(user.email, {
		betaEmails: env.BETA_EMAILS,
		aiOpen: env.AI_OPEN,
	});
}

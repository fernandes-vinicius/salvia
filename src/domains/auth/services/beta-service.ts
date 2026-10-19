import "server-only";

import type { User } from "~/domains/auth/types/user-types";
import { isBetaEmail } from "~/shared/lib/beta";
import { getEnv } from "~/shared/lib/env";

/** Libera os recursos em beta pra quem está em `BETA_EMAILS`. */
export function isBetaUser(user: Pick<User, "email">) {
	return isBetaEmail(user.email, getEnv().BETA_EMAILS);
}

import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "~/shared/db";
import { getEnv } from "~/shared/lib/env";

const env = getEnv();

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: "pg" }),
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			// Sempre mostra o seletor de conta do Google, pra dar pra trocar
			// de conta depois de sair.
			prompt: "select_account",
		},
	},
	// `nextCookies` precisa ser o último plugin (aplica o Set-Cookie em
	// Server Actions).
	plugins: [nextCookies()],
});

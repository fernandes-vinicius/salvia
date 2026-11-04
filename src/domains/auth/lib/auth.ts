import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import {
	existingAccountEmail,
	resetPasswordEmail,
	verificationEmail,
} from "~/domains/auth/utils/auth-emails";
import { db } from "~/shared/db";
import { sendEmail } from "~/shared/lib/email";
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
	// Senha só entra com o e-mail confirmado: sem isso daria pra criar conta
	// com o e-mail de outra pessoa (e o Google não liga a uma conta não
	// confirmada). "Esqueci a senha" também cria a senha de quem só tem Google.
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: false,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...resetPasswordEmail({ ...user, url }),
			});
		},
		onExistingUserSignUp: async ({ user }) => {
			await sendEmail({
				to: user.email,
				...existingAccountEmail({
					...user,
					url: new URL("/login", env.BETTER_AUTH_URL).href,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...verificationEmail({ ...user, url }),
			});
		},
	},
	// No banco: na Vercel cada instância teria a sua memória. As regras
	// padrão já apertam login/cadastro (3 a cada 10 s) e e-mails (3 por min).
	rateLimit: { storage: "database" },
	// E-mails em segundo plano: a resposta não espera o envio (nem revela
	// pelo tempo se o e-mail tem conta) e a função não morre antes de mandar.
	advanced: { backgroundTasks: { handler: (promise) => after(promise) } },
	// `nextCookies` precisa ser o último plugin (aplica o Set-Cookie em
	// Server Actions).
	plugins: [nextCookies()],
});

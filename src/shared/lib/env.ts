import "server-only";

import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	// IA (beta): sem a chave, os recursos de IA avisam que estão indisponíveis.
	GEMINI_API_KEY: z.string().optional(),
	GEMINI_MODEL: z.string().optional(),
	BETA_EMAILS: z.string().optional(),
});

// Validação lazy: só quebra quando algo server-side realmente precisa das
// variáveis (ex.: primeira request de auth), não no `next build` de rotas que
// não usam banco. A mensagem lista exatamente o que falta no `.env`.
let cached: z.infer<typeof envSchema> | undefined;

export function getEnv() {
	if (cached) return cached;

	const result = envSchema.safeParse(process.env);
	if (!result.success) {
		throw new Error(
			`Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}\nVeja .env.example.`,
		);
	}

	cached = result.data;
	return cached;
}

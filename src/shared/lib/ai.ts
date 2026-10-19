import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { APICallError } from "ai";

import { getEnv } from "~/shared/lib/env";

// Modelo de IA dos recursos em beta (Gemini pelo AI SDK). Trocar de
// fornecedor = trocar este arquivo.

const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export const AI_NOT_CONFIGURED =
	"A IA não está configurada (falta GEMINI_API_KEY).";
export const AI_RATE_LIMITED =
	"Muitos pedidos agora. Espere um minuto e tente de novo.";

/** O modelo configurado, ou null sem `GEMINI_API_KEY`. */
export function getAiModel() {
	const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
	if (!GEMINI_API_KEY) return null;
	const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
	return google(GEMINI_MODEL || DEFAULT_MODEL);
}

/** O fornecedor recusou por excesso de pedidos (cota do plano grátis). */
export function isRateLimited(error: unknown) {
	return APICallError.isInstance(error) && error.statusCode === 429;
}

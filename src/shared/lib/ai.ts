import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { APICallError, RetryError } from "ai";

import { getEnv } from "~/shared/lib/env";

// Modelo de IA dos recursos em beta (Gemini pelo AI SDK). Trocar de
// fornecedor = trocar este arquivo.

const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export const AI_NOT_CONFIGURED =
	"A IA não está configurada (falta GEMINI_API_KEY).";
export const AI_RATE_LIMITED =
	"A IA está ocupada agora. Espere um minuto e tente de novo.";

/** O modelo configurado, ou null sem `GEMINI_API_KEY`. */
export function getAiModel() {
	const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
	if (!GEMINI_API_KEY) return null;
	const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
	return google(GEMINI_MODEL || DEFAULT_MODEL);
}

export const AI_UNAVAILABLE =
	"A IA está indisponível no momento. Tente de novo mais tarde.";

/** Status HTTP da resposta do fornecedor, olhando o último erro das tentativas. */
function statusOf(error: unknown) {
	const cause = RetryError.isInstance(error) ? error.lastError : error;
	return APICallError.isInstance(cause) ? cause.statusCode : undefined;
}

/**
 * O fornecedor recusou por excesso de pedidos (cota do plano grátis, 429)
 * ou está sobrecarregado (503).
 */
export function isRateLimited(error: unknown): boolean {
	const status = statusOf(error);
	return status === 429 || status === 503;
}

/**
 * Mensagem pros erros do fornecedor que não dependem do recurso: sem crédito
 * no pré-pago do Gemini (402) ou ocupada (429/503). Null = cada recurso usa a
 * sua.
 */
export function aiErrorMessage(error: unknown): string | null {
	if (statusOf(error) === 402) {
		console.error("[ai] Gemini sem crédito (402): recarregue o pré-pago");
		return AI_UNAVAILABLE;
	}
	return isRateLimited(error) ? AI_RATE_LIMITED : null;
}

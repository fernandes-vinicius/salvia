import { APICallError, RetryError } from "ai";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	AI_RATE_LIMITED,
	AI_UNAVAILABLE,
	aiErrorMessage,
	isRateLimited,
} from "~/shared/lib/ai";

const apiError = (statusCode: number) =>
	new APICallError({
		message: `HTTP ${statusCode}`,
		url: "https://generativelanguage.googleapis.com",
		requestBodyValues: {},
		statusCode,
	});

const retried = (error: unknown) =>
	new RetryError({
		message: "Failed after 3 attempts",
		reason: "maxRetriesExceeded",
		errors: [error],
	});

describe("isRateLimited", () => {
	it("reconhece 429 e 503, inclusive depois das tentativas", () => {
		expect(isRateLimited(apiError(429))).toBe(true);
		expect(isRateLimited(retried(apiError(503)))).toBe(true);
		expect(isRateLimited(apiError(402))).toBe(false);
	});
});

describe("aiErrorMessage", () => {
	it("sem crédito (402) a IA fica indisponível, sem pedir pra tentar já", () => {
		expect(aiErrorMessage(apiError(402))).toBe(AI_UNAVAILABLE);
		expect(aiErrorMessage(retried(apiError(402)))).toBe(AI_UNAVAILABLE);
	});

	it("ocupada (429/503) pede pra esperar um minuto", () => {
		expect(aiErrorMessage(apiError(429))).toBe(AI_RATE_LIMITED);
		expect(aiErrorMessage(apiError(503))).toBe(AI_RATE_LIMITED);
	});

	it("outros erros ficam com a mensagem de cada recurso", () => {
		expect(aiErrorMessage(apiError(500))).toBeNull();
		expect(aiErrorMessage(new Error("boom"))).toBeNull();
	});
});

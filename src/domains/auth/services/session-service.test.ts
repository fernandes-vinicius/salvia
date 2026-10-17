import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "~/domains/auth/lib/auth";
import { getCurrentUser } from "~/domains/auth/services/session-service";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/navigation", () => ({
	redirect: vi.fn(() => {
		throw new Error("NEXT_REDIRECT");
	}),
}));
vi.mock("~/domains/auth/lib/auth", () => ({
	auth: { api: { getSession: vi.fn() } },
}));

const getSession = vi.mocked(auth.api.getSession);

describe("getCurrentUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redireciona pro login quando não há sessão", async () => {
		getSession.mockResolvedValue(null);

		await expect(getCurrentUser()).rejects.toThrow("NEXT_REDIRECT");
		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("retorna só os campos públicos do usuário", async () => {
		getSession.mockResolvedValue({
			user: {
				id: "u1",
				name: "Ana Souza",
				email: "ana@example.com",
				image: undefined,
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {},
		} as never);

		await expect(getCurrentUser()).resolves.toEqual({
			id: "u1",
			name: "Ana Souza",
			email: "ana@example.com",
			image: null,
		});
	});
});

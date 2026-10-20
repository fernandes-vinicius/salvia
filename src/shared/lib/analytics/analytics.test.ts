import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	createAnalytics,
	posthogAssetsHost,
	posthogUiHost,
} from "~/shared/lib/analytics/analytics";

const fakeClient = () => ({
	capture: vi.fn(),
	identify: vi.fn(),
	reset: vi.fn(),
});

describe("createAnalytics", () => {
	let analytics: ReturnType<typeof createAnalytics>;
	beforeEach(() => {
		analytics = createAnalytics(true);
	});

	it("guarda os eventos até o PostHog carregar e envia na ordem", () => {
		analytics.track("receita_gerada", { refeicao: "Almoço" });
		analytics.identify({ id: "u1", name: "Ana", email: "ana@x.com" });
		const client = fakeClient();
		analytics.setClient(client);
		expect(client.capture).toHaveBeenCalledWith("receita_gerada", {
			refeicao: "Almoço",
		});
		expect(client.identify).toHaveBeenCalledWith("u1", {
			name: "Ana",
			email: "ana@x.com",
		});
	});

	it("depois de carregado, envia na hora", () => {
		const client = fakeClient();
		analytics.setClient(client);
		analytics.reset();
		expect(client.reset).toHaveBeenCalledOnce();
	});

	it("não acumula sem limite se o PostHog nunca carregar", () => {
		for (let i = 0; i < 200; i++) analytics.track("alimento_adicionado");
		const client = fakeClient();
		analytics.setClient(client);
		expect(client.capture).toHaveBeenCalledTimes(50);
	});

	it("desligado (sem chave ou fora de produção) não faz nada", () => {
		const off = createAnalytics(false);
		off.track("receita_gerada");
		const client = fakeClient();
		off.setClient(client);
		expect(client.capture).not.toHaveBeenCalled();
	});
});

describe("hosts do PostHog", () => {
	it("deriva o painel e os arquivos da região", () => {
		expect(posthogUiHost("https://us.i.posthog.com")).toBe(
			"https://us.posthog.com",
		);
		expect(posthogUiHost("https://eu.i.posthog.com")).toBe(
			"https://eu.posthog.com",
		);
		expect(posthogAssetsHost("https://us.i.posthog.com")).toBe(
			"https://us-assets.i.posthog.com",
		);
		expect(posthogAssetsHost("https://eu.i.posthog.com/")).toBe(
			"https://eu-assets.i.posthog.com",
		);
	});
});

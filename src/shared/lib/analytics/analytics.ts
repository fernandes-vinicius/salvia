// Eventos de produto (PostHog). O SDK carrega depois da página (ver
// `src/instrumentation-client.ts`); até lá os eventos ficam numa fila curta.
// Desligado sem `NEXT_PUBLIC_POSTHOG_KEY` ou fora de produção.

/** Eventos do funil (nomes em pt-BR, estáveis: mudar quebra os gráficos). */
export type AnalyticsEvent =
	| "tmb_salva"
	| "meta_salva"
	| "alimento_adicionado"
	| "dieta_pronta_aplicada"
	| "dieta_compartilhada"
	| "dieta_lida"
	| "dieta_importada"
	| "checkin"
	| "medida_salva"
	| "receita_gerada"
	| "receita_salva"
	| "receita_compartilhada"
	| "refeicao_variada_gerada"
	| "refeicao_variada_usada"
	| "refeicao_variada_desfeita"
	| "sugestao_enviada";

type Properties = Record<string, string | number | boolean | null>;

interface AnalyticsClient {
	capture: (event: string, properties?: Properties) => unknown;
	identify: (id: string, properties?: Properties) => unknown;
	reset: () => unknown;
}

const MAX_QUEUE = 50;

export function createAnalytics(enabled: boolean) {
	let client: AnalyticsClient | null = null;
	const queue: ((client: AnalyticsClient) => void)[] = [];

	const run = (fn: (client: AnalyticsClient) => void) => {
		if (!enabled) return;
		if (client) fn(client);
		else if (queue.length < MAX_QUEUE) queue.push(fn);
	};

	return {
		setClient(next: AnalyticsClient) {
			if (!enabled) return;
			client = next;
			for (const fn of queue.splice(0)) fn(next);
		},
		track(event: AnalyticsEvent, properties?: Properties) {
			run((c) => c.capture(event, properties));
		},
		/** Liga a sessão ao usuário logado (nome e e-mail só pro painel). */
		identify(user: { id: string; name: string; email: string }) {
			run((c) => c.identify(user.id, { name: user.name, email: user.email }));
		},
		/** Ao sair: a próxima pessoa no aparelho começa anônima. */
		reset() {
			run((c) => c.reset());
		},
	};
}

export const analytics = createAnalytics(
	Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) &&
		process.env.NODE_ENV === "production",
);

/** "https://us.i.posthog.com" → "https://us.posthog.com" (painel/toolbar). */
export function posthogUiHost(apiHost: string) {
	return apiHost.replace(/\/$/, "").replace(".i.posthog.com", ".posthog.com");
}

/** "https://us.i.posthog.com" → "https://us-assets.i.posthog.com". */
export function posthogAssetsHost(apiHost: string) {
	return apiHost.replace(/\/$/, "").replace(/\/\/(\w+)\.i\./, "//$1-assets.i.");
}

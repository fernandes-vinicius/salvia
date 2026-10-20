import { analytics, posthogUiHost } from "~/shared/lib/analytics/analytics";

// PostHog (funil, retenção, gravações mascaradas). Só em produção e com a
// chave; o SDK é baixado depois que a página carrega e o navegador fica
// livre, pra não pesar no carregamento (Lighthouse). Os dados passam pelo
// próprio site (`/ingest`, rewrite no next.config) pra não serem barrados
// por bloqueador de anúncio.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function start() {
	import("posthog-js")
		.then(({ default: posthog }) => {
			posthog.init(key as string, {
				api_host: "/ingest",
				ui_host: posthogUiHost(host),
				defaults: "2026-08-30",
				// Perfil só pra quem fez login (identify); visitante fica anônimo.
				person_profiles: "identified_only",
				// Sem cookie: o id anônimo fica no localStorage do aparelho.
				persistence: "localStorage",
				session_recording: {
					maskAllInputs: true,
					// Área logada (dieta, peso, medidas): todo texto mascarado.
					maskTextSelector: "[data-ph-mask], [data-ph-mask] *",
				},
				// Extras que não usamos: menos script baixado depois da página.
				disable_surveys: true,
				disable_web_experiments: true,
				capture_performance: false,
				loaded: (client) => analytics.setClient(client),
			});
		})
		.catch(() => undefined);
}

if (key && process.env.NODE_ENV === "production") {
	const schedule = () => {
		if ("requestIdleCallback" in window) {
			requestIdleCallback(start, { timeout: 5000 });
		} else {
			setTimeout(start, 2000);
		}
	};
	if (document.readyState === "complete") schedule();
	else window.addEventListener("load", schedule, { once: true });
}

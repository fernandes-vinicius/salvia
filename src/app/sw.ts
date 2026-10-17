/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
	CacheFirst,
	ExpirationPlugin,
	NetworkOnly,
	Serwist,
	StaleWhileRevalidate,
} from "serwist";

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

// Só arquivos estáticos vão pro cache. Páginas, dados do RSC e a API ficam
// sempre na rede: são dados pessoais (dieta, medidas) que não devem sobrar no
// aparelho depois do logout, nem aparecer desatualizados. Sem internet, a
// navegação cai na página /~offline (pré-cacheada).
const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		{
			// JS/CSS do build têm hash no nome: nunca mudam.
			matcher: ({ url, sameOrigin }) =>
				sameOrigin && url.pathname.startsWith("/_next/static/"),
			handler: new CacheFirst({
				cacheName: "next-static",
				plugins: [new ExpirationPlugin({ maxEntries: 200 })],
			}),
		},
		{
			matcher: ({ request, sameOrigin }) =>
				sameOrigin &&
				(request.destination === "image" || request.destination === "font"),
			handler: new StaleWhileRevalidate({
				cacheName: "static-assets",
				plugins: [
					new ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					}),
				],
			}),
		},
		{ matcher: () => true, handler: new NetworkOnly() },
	],
	fallbacks: {
		entries: [
			{
				url: "/~offline",
				matcher: ({ request }) => request.destination === "document",
			},
		],
	},
});

serwist.addEventListeners();

import type { MetadataRoute } from "next";

import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

// Manifest do PWA (Next serve em /manifest.webmanifest). Abre direto no app:
// quem não tem sessão cai no login pelo proxy.
export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/dashboard",
		name: `${APP_NAME} · ${APP_TAGLINE}`,
		short_name: APP_NAME,
		description:
			"Planeje e acompanhe sua dieta: refeições, macros e gasto calórico.",
		lang: "pt-BR",
		start_url: "/dashboard",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		// Creme do tema claro (splash e barra de status no Android).
		background_color: "#F6F4EC",
		theme_color: "#F6F4EC",
		categories: ["health", "fitness", "food"],
		icons: [
			{ src: "/pwa-64x64.png", sizes: "64x64", type: "image/png" },
			{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
			{
				src: "/maskable-icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		shortcuts: [
			{
				name: "Dieta",
				url: "/dieta",
				icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
			},
			{
				name: "Minhas medidas",
				url: "/medidas",
				icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
			},
		],
	};
}

import type { MetadataRoute } from "next";

import { SITE_URL } from "~/shared/lib/app-config";

// Só a landing e o login são públicos; o app logado e as rotas técnicas
// ficam fora dos buscadores (as páginas também têm `noindex`).
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: ["/", "/login"],
			disallow: [
				"/api/",
				"/dashboard",
				"/tmb",
				"/meta",
				"/dieta",
				"/medidas",
				"/alimentos",
				"/configuracoes",
				"/design-system",
				"/serwist/",
				"/~offline",
			],
		},
		sitemap: new URL("/sitemap.xml", SITE_URL).href,
		host: SITE_URL.origin,
	};
}

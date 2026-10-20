import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

import { posthogAssetsHost } from "./src/shared/lib/analytics/analytics";

const posthogHost =
	process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const nextConfig: NextConfig = {
	/* config options here */
	cacheComponents: true,
	// PostHog pelo próprio site (bloqueadores de anúncio barram o domínio
	// deles). O SDK manda pra `/ingest/...` com barra no fim às vezes.
	skipTrailingSlashRedirect: true,
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: `${posthogAssetsHost(posthogHost)}/static/:path*`,
			},
			{
				source: "/ingest/array/:path*",
				destination: `${posthogAssetsHost(posthogHost)}/array/:path*`,
			},
			{ source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
		];
	},
	partialPrefetching: true,
	experimental: {
		// CSS do Tailwind é pequeno: vai no próprio HTML, sem request que
		// bloqueia a renderização (melhora FCP/LCP na primeira visita).
		inlineCss: true,
		// Importar dieta manda PDF/fotos pra Server Action (até 3,5 MB, ver
		// `MAX_UPLOAD_BYTES`); abaixo dos 4,5 MB de corpo da Vercel.
		serverActions: { bodySizeLimit: "4mb" },
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default withSerwist(nextConfig);

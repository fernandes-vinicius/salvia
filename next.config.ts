import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	cacheComponents: true,
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

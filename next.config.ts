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

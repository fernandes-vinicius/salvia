import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

// Design system do Sálvia no Storybook: fundamentos (tokens) em MDX em
// `src/stories/` e os componentes com `*.stories.tsx` ao lado de cada um.
const config: StorybookConfig = {
	framework: "@storybook/nextjs-vite",
	stories: ["../src/stories/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-themes",
	],
	staticDirs: ["../public"],
	core: { disableTelemetry: true },
	async viteFinal(viteConfig) {
		viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
		viteConfig.resolve = {
			...viteConfig.resolve,
			alias: {
				...viteConfig.resolve?.alias,
				"~": fileURLToPath(new URL("../src", import.meta.url)),
			},
		};
		return viteConfig;
	},
};

export default config;

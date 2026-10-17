import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Config separada do Next: o Vitest roda sobre Vite, então basta o
// `@vitejs/plugin-react` pra JSX, com o alias `~/*` via `tsconfigPaths`.
export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		passWithNoTests: true,
		// `globals: true` é o que permite o auto-cleanup do
		// @testing-library/react (ele detecta o `afterEach` global do runner
		// pra desmontar entre testes) — sem isso o DOM de um teste vaza pro
		// próximo no mesmo arquivo.
		globals: true,
	},
	server: {
		host: true,
		port: 3000,
	},
});

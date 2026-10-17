import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

import { ThemeProvider } from "~/providers/theme-provider";

// Providers de todas as páginas (inclusive a landing, que precisa carregar o
// mínimo de JS). O que só o app usa fica em `ShellProviders`.
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		// Service worker do PWA (src/app/sw.ts). Fora do dev pra não brigar com o
		// hot reload; `cacheOnNavigation` desligado: páginas não vão pro cache.
		<SerwistProvider
			swUrl="/serwist/sw.js"
			disable={process.env.NODE_ENV === "development"}
			cacheOnNavigation={false}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
			>
				{children}
			</ThemeProvider>
		</SerwistProvider>
	);
}

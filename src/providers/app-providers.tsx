import { SerwistProvider } from "@serwist/turbopack/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		// Service worker do PWA (src/app/sw.ts). Fora do dev pra não brigar com o
		// hot reload; `cacheOnNavigation` desligado: páginas não vão pro cache.
		<SerwistProvider
			swUrl="/serwist/sw.js"
			disable={process.env.NODE_ENV === "development"}
			cacheOnNavigation={false}
		>
			<NuqsAdapter>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>
						{children}
						<Toaster position="top-center" closeButton richColors />
					</TooltipProvider>
				</ThemeProvider>
			</NuqsAdapter>
		</SerwistProvider>
	);
}

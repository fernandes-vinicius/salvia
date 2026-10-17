import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
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
	);
}

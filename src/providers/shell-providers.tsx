import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

// Providers das telas do app e do login (estado na URL, tooltips e toasts).
// Ficam fora do layout raiz pra não pesar no JS da landing.
export function ShellProviders({ children }: { children: ReactNode }) {
	return (
		<NuqsAdapter>
			<TooltipProvider>
				{children}
				<Toaster position="top-center" closeButton richColors />
			</TooltipProvider>
		</NuqsAdapter>
	);
}

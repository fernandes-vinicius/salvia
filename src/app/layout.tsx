import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { AppProviders } from "~/providers/app-providers";
import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";
import { cn } from "~/shared/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
	title: {
		default: `${APP_NAME} · ${APP_TAGLINE}`,
		template: `%s — ${APP_NAME}`,
	},
	description:
		"Planeje e acompanhe sua dieta: refeições, macros e gasto calórico.",
	applicationName: APP_NAME,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="pt-BR"
			className={cn("h-full antialiased", inter.variable, manrope.variable)}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}

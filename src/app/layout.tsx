import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { AppProviders } from "~/providers/app-providers";
import {
	APP_DESCRIPTION,
	APP_NAME,
	APP_TAGLINE,
	SITE_URL,
} from "~/shared/lib/app-config";
import { cn } from "~/shared/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: {
		default: `${APP_NAME} · ${APP_TAGLINE}`,
		template: `%s — ${APP_NAME}`,
	},
	description: APP_DESCRIPTION,
	applicationName: APP_NAME,
	keywords: [
		"dieta",
		"macros",
		"calculadora de macros",
		"TMB",
		"gasto calórico",
		"cutting",
		"bulking",
		"tabela TACO",
		"proteína",
	],
	openGraph: {
		type: "website",
		locale: "pt_BR",
		siteName: APP_NAME,
		title: `${APP_NAME} · ${APP_TAGLINE}`,
		description: APP_DESCRIPTION,
		url: "/",
	},
	twitter: { card: "summary_large_image" },
	// iOS: abre em tela cheia quando adicionado à Tela de Início.
	appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
	icons: { apple: "/apple-touch-icon-180x180.png" },
	formatDetection: { telephone: false },
};

// `viewport-fit=cover` libera o `env(safe-area-inset-*)` usado pela barra de
// abas flutuante (home indicator do iOS). Cores = `--background` de cada tema.
export const viewport: Viewport = {
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#F6F4EC" },
		{ media: "(prefers-color-scheme: dark)", color: "#131813" },
	],
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

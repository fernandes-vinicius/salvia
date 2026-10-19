import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";

import "~/app/globals.css";

// Fundo e fonte do app em toda story; tema claro (padrão) ou escuro pela
// classe `.dark` no <html>, como faz o next-themes.
const preview: Preview = {
	parameters: {
		layout: "padded",
		controls: { expanded: true, sort: "requiredFirst" },
		backgrounds: { disable: true },
		a11y: { test: "error" },
		options: {
			storySort: {
				order: [
					"Introdução",
					"Fundamentos",
					["Cores", "Tipografia", "Raios e espaçamento", "Ícones"],
					"Componentes",
					"App",
					"Dieta",
				],
			},
		},
	},
	decorators: [
		withThemeByClassName({
			themes: { Claro: "", Escuro: "dark" },
			defaultTheme: "Claro",
			parentSelector: "html",
		}),
		(Story) => (
			<div className="bg-background font-sans text-foreground antialiased">
				<Story />
			</div>
		),
	],
};

export default preview;

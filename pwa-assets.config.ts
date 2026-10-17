import {
	defineConfig,
	minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Ícones do PWA a partir do SVG (`bun run generate-pwa-assets`). O SVG já tem
// fundo cheio e a folha dentro da área segura (círculo de 80%), então maskable
// e Apple usam sem margem extra; o fundo só cobre eventuais transparências.
const background = "#3E6A3A";

export default defineConfig({
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			padding: 0,
			resizeOptions: { background },
		},
		apple: {
			...minimal2023Preset.apple,
			padding: 0,
			resizeOptions: { background },
		},
	},
	images: ["public/logo-salvia-icon.svg"],
});

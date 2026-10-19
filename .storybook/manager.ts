import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Interface do Storybook com a marca do Sálvia (verde-sálvia + creme).
addons.setConfig({
	theme: create({
		base: "light",
		brandTitle: "Sálvia · Design system",
		brandTarget: "_self",
		colorPrimary: "#3E6A3A",
		colorSecondary: "#3E6A3A",
		appBg: "#F6F4EC",
		appContentBg: "#FCFBF7",
		appPreviewBg: "#F6F4EC",
		appBorderColor: "#E4E0D3",
		appBorderRadius: 14,
		textColor: "#1E2A1F",
		textMutedColor: "#5E6659",
		barBg: "#FCFBF7",
		barSelectedColor: "#3E6A3A",
		fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
	}),
});

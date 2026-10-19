import { ImageResponse } from "next/og";

import { APP_NAME, APP_TAGLINE } from "~/shared/lib/app-config";

// Imagem de compartilhamento (WhatsApp, redes, busca). Gerada no build.
export const alt = `${APP_NAME} · ${APP_TAGLINE}: sua dieta e seus macros, sem planilha`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
	background: "#F6F4EC",
	card: "#FCFBF7",
	primary: "#3E6A3A",
	secondary: "#DDE8D0",
	muted: "#5E6659",
	protein: "#3E6A3A",
	carb: "#C9A15A",
	fat: "#C2765A",
};

const HEADLINE = "Sua dieta tá uma bagunça? Bora colocar em ordem.";

/**
 * Manrope (fonte dos títulos do app) só com os caracteres usados. Em cache,
 * pra imagem ser gerada uma vez no build em vez de buscar a fonte a cada
 * compartilhamento.
 */
async function loadManrope(text: string) {
	"use cache";
	try {
		const css = await (
			await fetch(
				`https://fonts.googleapis.com/css2?family=Manrope:wght@600&text=${encodeURIComponent(text)}`,
			)
		).text();
		const url = css.match(/src: url\((.+?)\) format/)?.[1];
		if (!url) return null;
		return await (await fetch(url)).arrayBuffer();
	} catch {
		// Sem rede no build: usa a fonte padrão do ImageResponse.
		return null;
	}
}

const MACROS = [
	{ label: "Proteína", value: "177 / 176 g", color: COLORS.protein, fill: 1 },
	{
		label: "Carboidrato",
		value: "203 / 213 g",
		color: COLORS.carb,
		fill: 0.95,
	},
	{ label: "Gordura", value: "63 / 64 g", color: COLORS.fat, fill: 0.98 },
];

export default async function OpengraphImage() {
	const text = `${APP_NAME}${APP_TAGLINE}${HEADLINE}Planejado × meta2.182 / 2.130 kcal${MACROS.map((m) => m.label + m.value).join("")}`;
	const manrope = await loadManrope(text);

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				padding: 72,
				gap: 64,
				alignItems: "center",
				background: COLORS.background,
				fontFamily: manrope ? "Manrope" : undefined,
				color: "#1E261C",
			}}
		>
			<div
				style={{ display: "flex", flexDirection: "column", flex: 1, gap: 32 }}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<div
						style={{
							display: "flex",
							width: 64,
							height: 64,
							borderRadius: 999,
							background: COLORS.primary,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: a imagem toda tem `alt`; o <title> viraria texto no ImageResponse */}
						<svg
							width="34"
							height="34"
							viewBox="0 0 24 24"
							fill="none"
							stroke={COLORS.background}
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20" />
							<path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13" />
						</svg>
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<span style={{ fontSize: 34 }}>{APP_NAME}</span>
						<span style={{ fontSize: 22, color: COLORS.muted }}>
							{APP_TAGLINE}
						</span>
					</div>
				</div>
				<div style={{ fontSize: 60, lineHeight: 1.1, letterSpacing: -1 }}>
					{HEADLINE}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: 400,
					gap: 22,
					padding: 36,
					borderRadius: 40,
					background: COLORS.card,
					border: `12px solid ${COLORS.secondary}`,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
					<span style={{ fontSize: 24 }}>Planejado × meta</span>
					<span style={{ fontSize: 20, color: COLORS.muted }}>
						2.182 / 2.130 kcal
					</span>
				</div>
				{MACROS.map((macro) => (
					<div
						key={macro.label}
						style={{ display: "flex", flexDirection: "column", gap: 8 }}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 20,
							}}
						>
							<span>{macro.label}</span>
							<span style={{ color: COLORS.muted }}>{macro.value}</span>
						</div>
						<div
							style={{
								display: "flex",
								height: 12,
								borderRadius: 999,
								background: "#EEEBE0",
							}}
						>
							<div
								style={{
									width: `${macro.fill * 100}%`,
									borderRadius: 999,
									background: macro.color,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>,
		{
			...size,
			fonts: manrope
				? [{ name: "Manrope", data: manrope, weight: 600, style: "normal" }]
				: undefined,
		},
	);
}

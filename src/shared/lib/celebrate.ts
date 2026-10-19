"use client";

// Comemorações ao cumprir metas, proporcionais à conquista:
// - `tap`: marcou uma refeição (punhado de partículas saindo do botão);
// - `goal`: meta batida (pesagem, dieta na meta, fibra);
// - `day`: dia completo (chuva de confete na tela toda);
// - `milestone`: marco de sequência (dois disparos laterais, mais longo).
// O `canvas-confetti` só é baixado na primeira comemoração (não pesa na
// landing). Nada acontece com "reduzir movimento" ligado.

export type CelebrationLevel = "tap" | "goal" | "day" | "milestone";

/** Ponto de origem: um retângulo da tela (ex.: o botão tocado) ou x/y 0–1. */
export type CelebrationOrigin = DOMRect | { x: number; y: number };

const TOKENS = [
	"primary",
	"secondary",
	"macro-carb",
	"macro-fat",
	"macro-protein-vegetal",
];

/** Cores da marca a partir dos tokens (acompanham o tema claro/escuro). */
function brandColors() {
	const style = getComputedStyle(document.documentElement);
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1;
	const context = canvas.getContext("2d");
	if (!context) return undefined;
	return TOKENS.map((token) => {
		context.fillStyle =
			style.getPropertyValue(`--${token}`).trim() || "#3e6a3a";
		context.fillRect(0, 0, 1, 1);
		const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
		return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
	});
}

function toPoint(origin?: CelebrationOrigin) {
	if (!origin) return { x: 0.5, y: 0.6 };
	if ("width" in origin) {
		return {
			x: (origin.left + origin.width / 2) / window.innerWidth,
			y: (origin.top + origin.height / 2) / window.innerHeight,
		};
	}
	return origin;
}

export function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

const VIBRATION: Record<CelebrationLevel, number | number[]> = {
	tap: 10,
	goal: 20,
	day: [15, 60, 30],
	milestone: [20, 70, 20, 70, 40],
};

export async function celebrate(
	level: CelebrationLevel,
	origin?: CelebrationOrigin,
) {
	if (typeof window === "undefined" || prefersReducedMotion()) return;
	navigator.vibrate?.(VIBRATION[level]);

	const { default: confetti } = await import("canvas-confetti");
	const colors = brandColors();
	const base = { colors, disableForReducedMotion: true, zIndex: 60 };
	const point = toPoint(origin);

	if (level === "tap") {
		confetti({
			...base,
			origin: point,
			particleCount: 14,
			spread: 55,
			startVelocity: 18,
			gravity: 0.9,
			scalar: 0.6,
			ticks: 70,
			shapes: ["circle"],
		});
		return;
	}

	if (level === "goal") {
		confetti({
			...base,
			origin: point,
			particleCount: 60,
			spread: 70,
			startVelocity: 32,
			scalar: 0.8,
		});
		return;
	}

	if (level === "day") {
		confetti({
			...base,
			origin: { x: 0.5, y: 0.7 },
			particleCount: 120,
			spread: 90,
			startVelocity: 45,
		});
		setTimeout(
			() =>
				confetti({
					...base,
					origin: { x: 0.5, y: 0.6 },
					particleCount: 60,
					spread: 120,
					startVelocity: 30,
					scalar: 0.8,
				}),
			220,
		);
		return;
	}

	// Marco: dois canhões laterais por ~1,2 s.
	const end = Date.now() + 1200;
	const frame = () => {
		confetti({
			...base,
			particleCount: 4,
			angle: 60,
			spread: 60,
			origin: { x: 0, y: 0.75 },
		});
		confetti({
			...base,
			particleCount: 4,
			angle: 120,
			spread: 60,
			origin: { x: 1, y: 0.75 },
		});
		if (Date.now() < end) requestAnimationFrame(frame);
	};
	frame();
}

"use client";

import { useEffect } from "react";

import { clarityProjectId } from "~/shared/lib/analytics/clarity";

const id = clarityProjectId(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
const INTERACTIONS = [
	"pointerdown",
	"keydown",
	"scroll",
	"touchstart",
] as const;

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

function loadClarity(projectId: string) {
	const w = window as unknown as { clarity?: ClarityFn };
	if (w.clarity) return;
	const clarity: ClarityFn = (...args) => {
		clarity.q = clarity.q ?? [];
		clarity.q.push(args);
	};
	w.clarity = clarity;
	// Sem cookies: nada gravado no aparelho e sem banner de cookies; em troca,
	// cada página conta como uma visita.
	clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.clarity.ms/tag/${projectId}`;
	document.head.appendChild(script);
}

// Microsoft Clarity (mapa de calor e gravações) nas páginas públicas: landing,
// calculadoras e links compartilhados, onde chega quem vem das redes. Só em
// produção e só na primeira interação (tocar, rolar, clicar, digitar): a
// página abre leve (o Clarity pesa no carregamento e o servidor dele grava um
// cookie de terceiros ao baixar o script). A área logada usa o PostHog, com
// texto mascarado.
export function ClarityScript() {
	useEffect(() => {
		if (!id || process.env.NODE_ENV !== "production") return;
		const start = () => {
			for (const event of INTERACTIONS) {
				window.removeEventListener(event, start);
			}
			loadClarity(id);
		};
		for (const event of INTERACTIONS) {
			window.addEventListener(event, start, { once: true, passive: true });
		}
		return () => {
			for (const event of INTERACTIONS) {
				window.removeEventListener(event, start);
			}
		};
	}, []);
	return null;
}

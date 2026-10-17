"use client";

import { useEffect, useState } from "react";

import { usePrintSetup } from "~/shared/hooks/use-print-setup";
import { APP_NAME } from "~/shared/lib/app-config";

// Cabeçalho que só aparece no PDF (na tela já existe o da página) e ajuste da
// impressão (tema claro e nome do arquivo). A data é lida só no navegador:
// `new Date()` na renderização quebraria páginas estáticas.
export function PrintHeader() {
	const [today, setToday] = useState("");
	useEffect(() => setToday(new Date().toLocaleDateString("pt-BR")), []);
	// Nome sugerido do PDF: "Dieta 17-10-2026".
	usePrintSetup(`Dieta ${today.replaceAll("/", "-")}`.trim());

	return (
		<header className="hidden print:mb-2 print:flex print:flex-col print:gap-0.5">
			<h1 className="font-heading font-semibold text-2xl">Plano alimentar</h1>
			<p className="text-muted-foreground text-sm">
				{APP_NAME} · {today}
			</p>
		</header>
	);
}

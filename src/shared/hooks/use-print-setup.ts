"use client";

import { useEffect } from "react";

/**
 * Enquanto o componente está montado, toda impressão (botão ou Ctrl+P) sai no
 * tema claro, que é o que fica legível no papel/PDF, e com `title` como nome
 * sugerido do arquivo. Tudo volta ao normal depois de imprimir.
 */
export function usePrintSetup(title: string) {
	useEffect(() => {
		const html = document.documentElement;
		let restore: (() => void) | null = null;

		function before() {
			const wasDark = html.classList.contains("dark");
			const colorScheme = html.style.colorScheme;
			const previousTitle = document.title;
			html.classList.remove("dark");
			html.style.colorScheme = "light";
			document.title = title;
			restore = () => {
				if (wasDark) html.classList.add("dark");
				html.style.colorScheme = colorScheme;
				document.title = previousTitle;
			};
		}

		function after() {
			restore?.();
			restore = null;
		}

		window.addEventListener("beforeprint", before);
		window.addEventListener("afterprint", after);
		return () => {
			window.removeEventListener("beforeprint", before);
			window.removeEventListener("afterprint", after);
			after();
		};
	}, [title]);
}

"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * `top` pra uma coluna `position: sticky` que pode ser mais alta que a tela.
 * Se cabe, gruda a `gap.top` px do topo; se não, o `top` fica negativo e ela
 * rola junto com a página até o fim aparecer (a `gap.bottom` px da borda de
 * baixo, acima da barra de abas), e aí gruda, sem rolagem interna.
 * Recalcula quando a coluna ou a janela mudam de tamanho.
 */
export function useStickyTop(
	ref: RefObject<HTMLElement | null>,
	{ top: topGap = 24, bottom: bottomGap = 24 } = {},
) {
	const [top, setTop] = useState(topGap);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const update = () =>
			setTop(
				Math.min(topGap, window.innerHeight - element.offsetHeight - bottomGap),
			);

		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		window.addEventListener("resize", update);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
		};
	}, [ref, topGap, bottomGap]);

	return top;
}

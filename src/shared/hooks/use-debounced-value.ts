"use client";

import { useEffect, useState } from "react";

// Segura a propagação de `value` por `delayMs` — cada mudança reinicia o
// timer, então só o último valor (depois de o usuário parar de digitar)
// chega a ser retornado. Usado pra evitar filtrar/buscar a cada tecla.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
		return () => clearTimeout(timeoutId);
	}, [value, delayMs]);

	return debouncedValue;
}

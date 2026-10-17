"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
	/** Persiste o valor; retorna `false` (ou lança) em caso de erro. */
	save: (value: T) => Promise<boolean>;
	/** Espera desde a última mudança antes de salvar (ms). */
	delay?: number;
}

/**
 * Autosave com debounce: `schedule(value)` a cada mudança e só o último valor
 * é salvo depois de `delay` ms parado. Saves rodam em fila (um por vez, na
 * ordem) pra uma resposta antiga nunca sobrescrever uma mais nova, e o que
 * estiver pendente é salvo ao sair da página/desmontar.
 */
export function useAutosave<T>({ save, delay = 600 }: UseAutosaveOptions<T>) {
	const [status, setStatus] = useState<AutosaveStatus>("idle");
	const saveRef = useRef(save);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingRef = useRef<{ value: T } | null>(null);
	const queueRef = useRef<Promise<void>>(Promise.resolve());

	useEffect(() => {
		saveRef.current = save;
	});

	const flush = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		const pending = pendingRef.current;
		if (!pending) return queueRef.current;
		pendingRef.current = null;

		queueRef.current = queueRef.current.then(async () => {
			setStatus("saving");
			const ok = await saveRef.current(pending.value).catch(() => false);
			// Se chegou mudança nova enquanto salvava, ela define o status.
			if (pendingRef.current) return;
			setStatus(ok ? "saved" : "error");
		});

		return queueRef.current;
	}, []);

	const schedule = useCallback(
		(value: T) => {
			pendingRef.current = { value };
			setStatus("pending");
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(flush, delay);
		},
		[delay, flush],
	);

	useEffect(() => {
		const handlePageHide = () => void flush();
		window.addEventListener("pagehide", handlePageHide);
		return () => {
			window.removeEventListener("pagehide", handlePageHide);
			void flush();
		};
	}, [flush]);

	return { status, schedule, flush };
}

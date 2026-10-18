"use client";

import { useEffect, useEffectEvent } from "react";
import type { z } from "zod";

import {
	type CalculatorDraft,
	takeCalculatorDraft,
} from "~/domains/calculators/utils/calculator-draft";

interface DraftImportOptions<K extends keyof CalculatorDraft> {
	key: K;
	/** Valida o que veio do navegador antes de usar (pode estar velho ou corrompido). */
	schema: z.ZodType<NonNullable<CalculatorDraft[K]>>;
	/** Só importa enquanto a tela ainda mostra o exemplo (sem dados salvos). */
	enabled: boolean;
	onImport: (value: NonNullable<CalculatorDraft[K]>) => void;
}

// Na primeira visita a TMB/Meta, puxa os valores que a pessoa usou nas
// calculadoras públicas antes de criar a conta.
export function useCalculatorDraftImport<K extends keyof CalculatorDraft>({
	key,
	schema,
	enabled,
	onImport,
}: DraftImportOptions<K>) {
	const handleImport = useEffectEvent(onImport);

	useEffect(() => {
		if (!enabled) return;
		const parsed = schema.safeParse(takeCalculatorDraft(key));
		if (parsed.success) handleImport(parsed.data);
	}, [enabled, key, schema]);
}

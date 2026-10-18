import type { Goal } from "~/domains/goal/types/goal-types";
import type { BodyProfile } from "~/domains/profile/types/profile-types";

// O que a pessoa digitou nas calculadoras públicas fica só no navegador. Ao
// entrar no app pela primeira vez, TMB e Meta começam com esses valores em
// vez do exemplo (e o rascunho é apagado). Armazenamento pode falhar (aba
// anônima, bloqueio), então tudo é best-effort.

const STORAGE_KEY = "salvia:calculadora";

export interface CalculatorDraft {
	profile?: BodyProfile;
	goal?: Goal;
}

export function readCalculatorDraft(): CalculatorDraft {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CalculatorDraft) : {};
	} catch {
		return {};
	}
}

export function saveCalculatorDraft(patch: CalculatorDraft) {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ ...readCalculatorDraft(), ...patch }),
		);
	} catch {
		// Sem armazenamento: o app só começa com o exemplo.
	}
}

/** Pega (e remove) uma parte do rascunho. */
export function takeCalculatorDraft<K extends keyof CalculatorDraft>(
	key: K,
): CalculatorDraft[K] {
	const draft = readCalculatorDraft();
	const value = draft[key];
	if (value === undefined) return undefined;
	try {
		const { [key]: _, ...rest } = draft;
		if (Object.keys(rest).length === 0) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
	} catch {
		// Ignora: no pior caso o rascunho é oferecido de novo.
	}
	return value;
}

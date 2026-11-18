"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import type { ActionResult } from "~/domains/diet/actions/diet-actions";
import {
	applyVariant,
	discardVariant,
	startDraft,
} from "~/domains/diet/services/diet-service";

const fail = (error: string) => ({ ok: false as const, error });
const done = { ok: true as const, data: null };

/** "Experimentar mudanças": cria o rascunho (ou continua o que já existe). */
export async function startDraftAction(): Promise<ActionResult> {
	const user = await getCurrentUser();
	await startDraft(user.id);
	return done;
}

export async function discardDraftAction(): Promise<ActionResult> {
	const user = await getCurrentUser();
	await discardVariant(user.id, "draft");
	return done;
}

/** "Usar este rascunho"; com `keepPrevious`, guarda a dieta de antes. */
export async function applyDraftAction(input: unknown): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = z.object({ keepPrevious: z.boolean() }).safeParse(input);
	if (!parsed.success) return fail("Dados inválidos.");
	return (await applyVariant(user.id, "draft", parsed.data))
		? done
		: fail("Esse rascunho não existe mais.");
}

/** "Voltar à dieta anterior": a versão guardada volta a valer. */
export async function restorePreviousAction(): Promise<ActionResult> {
	const user = await getCurrentUser();
	return (await applyVariant(user.id, "previous"))
		? done
		: fail("Não há dieta anterior guardada.");
}

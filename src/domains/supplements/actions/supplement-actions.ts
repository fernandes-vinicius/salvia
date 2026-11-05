"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	MAX_SUPPLEMENTS,
	supplementInputSchema,
} from "~/domains/supplements/schemas/supplement-schema";
import {
	addSupplement,
	deleteSupplement,
	reorderSupplements,
	type SupplementWriteStatus,
	updateSupplement,
} from "~/domains/supplements/services/supplement-service";
import type { Supplement } from "~/domains/supplements/types/supplement-types";

export type SupplementActionResult<T = null> =
	| { ok: true; data: T }
	/** `stale`: o suplemento ou a refeição sumiu (mudou em outra aba). */
	| { ok: false; error: string; stale?: boolean };

const id = z.uuid();
const fail = (error: string) => ({ ok: false as const, error });
const stale = (error: string) => ({ ok: false as const, error, stale: true });
const done = <T>(data: T) => ({ ok: true as const, data });

function fromStatus(result: {
	status: SupplementWriteStatus;
	supplement?: Supplement;
}): SupplementActionResult<Supplement> {
	if (result.status === "ok" && result.supplement) {
		return done(result.supplement);
	}
	if (result.status === "limit") {
		return fail(`Dá pra anotar até ${MAX_SUPPLEMENTS} suplementos.`);
	}
	if (result.status === "meal-gone") {
		return stale("A refeição escolhida não existe mais.");
	}
	return stale("Suplemento não encontrado.");
}

function parseInput(input: unknown) {
	const parsed = supplementInputSchema.safeParse(input);
	return parsed.success
		? { data: parsed.data }
		: { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
}

export async function addSupplementAction(
	input: unknown,
	index?: unknown,
): Promise<SupplementActionResult<Supplement>> {
	const user = await getCurrentUser();
	const parsed = parseInput(input);
	if (!parsed.data) return fail(parsed.error);
	const position = z.number().int().min(0).optional().safeParse(index);
	return fromStatus(
		await addSupplement(
			user.id,
			parsed.data,
			position.success ? position.data : undefined,
		),
	);
}

export async function updateSupplementAction(
	supplementId: unknown,
	input: unknown,
): Promise<SupplementActionResult<Supplement>> {
	const user = await getCurrentUser();
	const parsedId = id.safeParse(supplementId);
	if (!parsedId.success) return fail("Suplemento inválido.");
	const parsed = parseInput(input);
	if (!parsed.data) return fail(parsed.error);
	return fromStatus(
		await updateSupplement(user.id, parsedId.data, parsed.data),
	);
}

export async function deleteSupplementAction(
	supplementId: unknown,
): Promise<SupplementActionResult> {
	const user = await getCurrentUser();
	const parsed = id.safeParse(supplementId);
	if (!parsed.success) return fail("Suplemento inválido.");
	return (await deleteSupplement(user.id, parsed.data))
		? done(null)
		: stale("Suplemento não encontrado.");
}

export async function reorderSupplementsAction(
	ids: unknown,
): Promise<SupplementActionResult> {
	const user = await getCurrentUser();
	const parsed = z.array(id).max(MAX_SUPPLEMENTS).safeParse(ids);
	if (!parsed.success) return fail("Ordem inválida.");
	return (await reorderSupplements(user.id, parsed.data))
		? done(null)
		: stale("Seus suplementos mudaram em outra aba.");
}

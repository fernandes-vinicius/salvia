"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { measurementSchema } from "~/domains/measurements/schemas/measurement-schema";
import {
	createMeasurement,
	deleteMeasurement,
	updateMeasurement,
} from "~/domains/measurements/services/measurement-service";
import type { Measurement } from "~/domains/measurements/types/measurement-types";

export type ActionResult<T = null> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const DUPLICATE_DAY =
	"Já existe uma medição nesse dia. Edite a medição existente ou escolha outra data.";

function parseInput(input: unknown) {
	const parsed = measurementSchema.safeParse(input);
	return parsed.success
		? { ok: true as const, data: parsed.data }
		: {
				ok: false as const,
				error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
			};
}

export async function saveMeasurementAction(
	id: unknown,
	input: unknown,
): Promise<ActionResult<Measurement>> {
	const user = await getCurrentUser();
	const parsed = parseInput(input);
	if (!parsed.ok) return parsed;

	if (id === null) {
		const created = await createMeasurement(user.id, parsed.data);
		return created === "duplicate-day"
			? { ok: false, error: DUPLICATE_DAY }
			: { ok: true, data: created };
	}

	const parsedId = z.uuid().safeParse(id);
	if (!parsedId.success) return { ok: false, error: "Medição inválida." };
	const updated = await updateMeasurement(user.id, parsedId.data, parsed.data);
	if (updated === "duplicate-day") return { ok: false, error: DUPLICATE_DAY };
	if (updated === "not-found") {
		return { ok: false, error: "Medição não encontrada." };
	}
	return { ok: true, data: updated };
}

export async function deleteMeasurementAction(
	id: unknown,
): Promise<ActionResult> {
	const user = await getCurrentUser();
	const parsed = z.uuid().safeParse(id);
	if (!parsed.success) return { ok: false, error: "Medição inválida." };
	return (await deleteMeasurement(user.id, parsed.data))
		? { ok: true, data: null }
		: { ok: false, error: "Medição não encontrada." };
}

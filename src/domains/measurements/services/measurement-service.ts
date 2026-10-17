import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type { MeasurementInput } from "~/domains/measurements/schemas/measurement-schema";
import type { Measurement } from "~/domains/measurements/types/measurement-types";
import { db } from "~/shared/db";
import { bodyMeasurement } from "~/shared/db/schema";

const columns = {
	id: bodyMeasurement.id,
	measuredOn: bodyMeasurement.measuredOn,
	weightKg: bodyMeasurement.weightKg,
	waistCm: bodyMeasurement.waistCm,
	neckCm: bodyMeasurement.neckCm,
	shoulderCm: bodyMeasurement.shoulderCm,
	chestCm: bodyMeasurement.chestCm,
	bicepsLeftCm: bodyMeasurement.bicepsLeftCm,
	bicepsRightCm: bodyMeasurement.bicepsRightCm,
	forearmLeftCm: bodyMeasurement.forearmLeftCm,
	forearmRightCm: bodyMeasurement.forearmRightCm,
	abdomenCm: bodyMeasurement.abdomenCm,
	hipsCm: bodyMeasurement.hipsCm,
	thighLeftCm: bodyMeasurement.thighLeftCm,
	thighRightCm: bodyMeasurement.thighRightCm,
	calfLeftCm: bodyMeasurement.calfLeftCm,
	calfRightCm: bodyMeasurement.calfRightCm,
};

/** Do mais recente pro mais antigo (como a lista é lida). */
export async function listMeasurements(userId: string): Promise<Measurement[]> {
	return db
		.select(columns)
		.from(bodyMeasurement)
		.where(eq(bodyMeasurement.userId, userId))
		.orderBy(desc(bodyMeasurement.measuredOn));
}

/** Postgres: violação de unique (já existe medição nesse dia). */
function isDuplicateDay(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"cause" in error &&
		(error.cause as { code?: string })?.code === "23505"
	);
}

export async function createMeasurement(
	userId: string,
	input: MeasurementInput,
): Promise<Measurement | "duplicate-day"> {
	try {
		const [row] = await db
			.insert(bodyMeasurement)
			.values({ userId, ...input })
			.returning(columns);
		return row;
	} catch (error) {
		if (isDuplicateDay(error)) return "duplicate-day";
		throw error;
	}
}

export async function updateMeasurement(
	userId: string,
	id: string,
	input: MeasurementInput,
): Promise<Measurement | "not-found" | "duplicate-day"> {
	try {
		const [row] = await db
			.update(bodyMeasurement)
			.set(input)
			.where(
				and(eq(bodyMeasurement.id, id), eq(bodyMeasurement.userId, userId)),
			)
			.returning(columns);
		return row ?? "not-found";
	} catch (error) {
		if (isDuplicateDay(error)) return "duplicate-day";
		throw error;
	}
}

export async function deleteMeasurement(userId: string, id: string) {
	const rows = await db
		.delete(bodyMeasurement)
		.where(and(eq(bodyMeasurement.id, id), eq(bodyMeasurement.userId, userId)))
		.returning({ id: bodyMeasurement.id });
	return rows.length > 0;
}

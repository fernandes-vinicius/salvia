"use server";

import {
	consumeAiQuota,
	refundAiQuota,
} from "~/domains/ai-usage/services/ai-usage-service";
import { limitReachedMessage } from "~/domains/ai-usage/utils/ai-usage";
import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { replaceDiet } from "~/domains/diet/services/diet-service";
import { importedDietInputSchema } from "~/domains/diet-import/schemas/diet-import-schema";
import { matchExtractedDiet } from "~/domains/diet-import/services/diet-match-service";
import { readDietDocuments } from "~/domains/diet-import/services/diet-reader-service";
import type { ImportedMeal } from "~/domains/diet-import/types/diet-import-types";
import { checkUploads } from "~/domains/diet-import/utils/diet-import";
import { allFoodsVisible } from "~/domains/food/services/food-service";

export type ImportActionResult<T = null> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const BETA_ONLY = "Recurso em teste, ainda não liberado pra sua conta.";

/**
 * Lê a dieta dos arquivos (PDF/fotos) com IA e casa os alimentos com a base.
 * Não salva nada: o resultado vai pra tela de revisão.
 */
export async function readDietAction(
	formData: FormData,
): Promise<ImportActionResult<ImportedMeal[]>> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) return fail(BETA_ONLY);

	const files = formData
		.getAll("files")
		.filter((entry): entry is File => entry instanceof File);
	const invalid = checkUploads(files);
	if (invalid) return fail(invalid);

	const documents = await Promise.all(
		files.map(async (file) => ({
			data: new Uint8Array(await file.arrayBuffer()),
			mediaType: file.type,
		})),
	);
	if (!(await consumeAiQuota(user.id, "diet-import"))) {
		return fail(limitReachedMessage("diet-import"));
	}
	const result = await readDietDocuments(documents);
	if (!result.ok) {
		await refundAiQuota(user.id, "diet-import");
		return fail(result.error);
	}

	const meals = await matchExtractedDiet(user.id, result.diet);
	if (meals.every((meal) => meal.items.length === 0)) {
		return fail(
			"Não encontrei refeições nesse arquivo. Confira se é a dieta e se dá pra ler bem.",
		);
	}
	return { ok: true, data: meals.filter((meal) => meal.items.length > 0) };
}

/** Substitui a dieta pela importada, depois da revisão. */
export async function saveImportedDietAction(
	input: unknown,
): Promise<ImportActionResult> {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) return fail(BETA_ONLY);

	const parsed = importedDietInputSchema.safeParse(input);
	if (!parsed.success) return fail("Confira a dieta antes de salvar.");

	const foodIds = parsed.data.meals.flatMap((meal) =>
		meal.items.flatMap((item) => [
			item.foodId,
			...item.options.map((option) => option.foodId),
		]),
	);
	if (!(await allFoodsVisible(user.id, foodIds))) {
		return fail("Algum alimento não existe mais. Leia a dieta de novo.");
	}

	await replaceDiet(user.id, parsed.data.meals);
	return { ok: true, data: null };
}

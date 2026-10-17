import { z } from "zod";

import { MEASUREMENT_KEYS } from "~/domains/measurements/utils/measurements";

// Campo vazio chega como `undefined` (formulário) e vira `null` explícito:
// na edição, apagar um valor precisa limpar a coluna no banco.
const optionalNumber = (min: number, max: number) =>
	z
		.number()
		.min(min, `Mínimo ${min}.`)
		.max(max, `Máximo ${max}.`)
		.nullable()
		.optional()
		.transform((value) => value ?? null);

const cm = optionalNumber(10, 250);

export const measurementSchema = z
	.object({
		measuredOn: z.iso.date("Data inválida."),
		weightKg: optionalNumber(20, 300),
		waistCm: cm,
		neckCm: cm,
		shoulderCm: cm,
		chestCm: cm,
		bicepsLeftCm: cm,
		bicepsRightCm: cm,
		forearmLeftCm: cm,
		forearmRightCm: cm,
		abdomenCm: cm,
		hipsCm: cm,
		thighLeftCm: cm,
		thighRightCm: cm,
		calfLeftCm: cm,
		calfRightCm: cm,
	})
	.refine((data) => MEASUREMENT_KEYS.some((key) => data[key] !== null), {
		message: "Preencha pelo menos uma medida.",
	});

export type MeasurementInput = z.output<typeof measurementSchema>;

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

/** Faixas aceitas (formulário e importação de planilha). */
export const MEASUREMENT_RANGES = {
	kg: { min: 20, max: 300 },
	cm: { min: 10, max: 250 },
} as const;

const cm = optionalNumber(MEASUREMENT_RANGES.cm.min, MEASUREMENT_RANGES.cm.max);

export const measurementSchema = z
	.object({
		measuredOn: z.iso.date("Data inválida."),
		weightKg: optionalNumber(
			MEASUREMENT_RANGES.kg.min,
			MEASUREMENT_RANGES.kg.max,
		),
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

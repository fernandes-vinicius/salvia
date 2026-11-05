import { z } from "zod";

import {
	SUPPLEMENT_DAYS,
	SUPPLEMENT_TIMINGS,
	SUPPLEMENT_UNITS,
} from "~/domains/supplements/types/supplement-types";

/** Limite por pessoa (lista de suplementos, não de alimentos). */
export const MAX_SUPPLEMENTS = 30;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido.");

/** O que chega na Server Action (o painel já manda os tipos certos). */
export const supplementInputSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Dê um nome ao suplemento.")
			.max(60, "Até 60 caracteres."),
		dose: z
			.number("Digite a dose, ex.: 5 ou 2,5.")
			.positive("A dose precisa ser maior que zero.")
			.max(100_000, "Dose grande demais."),
		unit: z.enum(SUPPLEMENT_UNITS),
		timing: z.enum(SUPPLEMENT_TIMINGS),
		mealId: z.uuid("Escolha a refeição.").nullable(),
		time: time.nullable(),
		days: z.enum(SUPPLEMENT_DAYS),
		weekdays: z.array(z.number().int().min(0).max(6)).max(7),
		note: z.string().trim().max(200, "Até 200 caracteres.").nullable(),
	})
	.superRefine((value, ctx) => {
		if (value.timing === "meal" && !value.mealId) {
			ctx.addIssue({
				code: "custom",
				path: ["mealId"],
				message: "Escolha a refeição.",
			});
		}
		if (value.timing === "time" && !value.time) {
			ctx.addIssue({
				code: "custom",
				path: ["time"],
				message: "Escolha o horário.",
			});
		}
		if (value.days === "weekdays" && value.weekdays.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["weekdays"],
				message: "Escolha pelo menos um dia.",
			});
		}
	})
	// Guarda só o que vale pro momento/dias escolhidos.
	.transform((value) => ({
		...value,
		mealId: value.timing === "meal" ? value.mealId : null,
		time: value.timing === "time" ? value.time : null,
		weekdays:
			value.days === "weekdays"
				? [...new Set(value.weekdays)].sort((a, b) => a - b)
				: [],
		note: value.note || null,
	}));

export type SupplementInput = z.output<typeof supplementInputSchema>;

/**
 * Formulário do painel (Conform): a dose chega como texto ("2,5") e os dias
 * como lista de textos; vira o mesmo formato da action.
 */
export const supplementFormSchema = z
	.object({
		name: z.string("Dê um nome ao suplemento."),
		dose: z
			.string("Digite a dose, ex.: 5 ou 2,5.")
			.trim()
			.regex(/^\d+([.,]\d+)?$/, "Digite a dose, ex.: 5 ou 2,5.")
			.transform((text) => Number(text.replace(",", "."))),
		unit: z.enum(SUPPLEMENT_UNITS, "Escolha a unidade."),
		timing: z.enum(SUPPLEMENT_TIMINGS, "Escolha quando."),
		mealId: z.string().optional(),
		time: z.string().optional(),
		days: z.enum(SUPPLEMENT_DAYS, "Escolha os dias."),
		weekdays: z.array(z.string()).optional(),
		note: z.string().optional(),
	})
	.transform((value) => ({
		...value,
		mealId: value.mealId ?? null,
		time: value.time ?? null,
		weekdays: (value.weekdays ?? []).map(Number),
		note: value.note ?? null,
	}))
	.pipe(supplementInputSchema);

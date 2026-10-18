import { z } from "zod";

export const FEEDBACK_KINDS = ["feature", "problem", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const feedbackSchema = z.object({
	kind: z.enum(FEEDBACK_KINDS),
	message: z
		.string()
		.trim()
		.min(5, "Conte um pouco mais (pelo menos 5 letras).")
		.max(1000, "Até 1.000 caracteres."),
	page: z.string().max(200).nullable(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

"use server";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { feedbackSchema } from "~/domains/feedback/schemas/feedback-schema";
import { sendFeedback } from "~/domains/feedback/services/feedback-service";

export type SendFeedbackResult = { ok: true } | { ok: false; error: string };

export async function sendFeedbackAction(
	input: unknown,
): Promise<SendFeedbackResult> {
	const user = await getCurrentUser();
	const parsed = feedbackSchema.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			error: parsed.error.issues[0]?.message ?? "Mensagem inválida.",
		};
	}
	const status = await sendFeedback(user.id, parsed.data);
	if (status === "limit") {
		return {
			ok: false,
			error: "Você já mandou várias mensagens hoje. Tente de novo amanhã.",
		};
	}
	return { ok: true };
}

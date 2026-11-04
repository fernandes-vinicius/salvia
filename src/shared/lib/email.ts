import "server-only";

import { getEnv } from "~/shared/lib/env";

const DEFAULT_FROM = "Sálvia <nao-responda@salvia-dieta.com.br>";

interface Email {
	to: string;
	subject: string;
	html: string;
	text: string;
}

/**
 * Manda um e-mail pelo Resend. Sem `RESEND_API_KEY` (dev), só mostra no
 * console, pra dar pra seguir o link de confirmação localmente.
 */
export async function sendEmail({ to, subject, html, text }: Email) {
	const env = getEnv();
	if (!env.RESEND_API_KEY) {
		console.info(`[email] Para: ${to}\nAssunto: ${subject}\n\n${text}`);
		return;
	}

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM ?? DEFAULT_FROM,
			to: [to],
			subject,
			html,
			text,
		}),
		signal: AbortSignal.timeout(10_000),
	});

	if (!response.ok) {
		console.error(
			`[email] Resend respondeu ${response.status}: ${await response.text()}`,
		);
	}
}

import { APP_NAME } from "~/shared/lib/app-config";

interface EmailInput {
	name: string;
	url: string;
}

export interface AuthEmail {
	subject: string;
	html: string;
	text: string;
}

const IGNORE = "Se não foi você, é só ignorar este e-mail.";

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function firstName(name: string) {
	return name.trim().split(/\s+/)[0] || "tudo bem";
}

// E-mail não lê os tokens do CSS: as cores da marca vão em hex inline.
function build({
	subject,
	name,
	url,
	lines,
	button,
	footnote,
}: EmailInput & {
	subject: string;
	lines: string[];
	button: string;
	footnote: string;
}): AuthEmail {
	const greeting = `Olá, ${firstName(name)}!`;
	const text = [
		greeting,
		"",
		...lines,
		"",
		`${button}: ${url}`,
		"",
		footnote,
		IGNORE,
		"",
		APP_NAME,
	].join("\n");

	const href = escapeHtml(url);
	const paragraph = (content: string) =>
		`<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1E2A1F">${content}</p>`;
	const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#F6F4EC;font-family:Inter,Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;padding:32px;background:#FFFFFF;border-radius:24px">
<p style="margin:0 0 24px;font-size:20px;font-weight:600;color:#3E6A3A">${escapeHtml(APP_NAME)}</p>
${paragraph(escapeHtml(greeting))}
${lines.map((line) => paragraph(escapeHtml(line))).join("\n")}
<p style="margin:24px 0"><a href="${href}" style="display:inline-block;padding:12px 20px;background:#3E6A3A;color:#FFFFFF;border-radius:999px;font-weight:600;text-decoration:none">${escapeHtml(button)}</a></p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#55604f">Se o botão não abrir, copie este endereço no navegador:<br><a href="${href}" style="color:#3E6A3A;word-break:break-all">${href}</a></p>
<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#55604f">${escapeHtml(footnote)} ${IGNORE}</p>
</div>
</body>
</html>`;

	return { subject, html, text };
}

export function verificationEmail(input: EmailInput) {
	return build({
		...input,
		subject: `Confirme seu e-mail no ${APP_NAME}`,
		lines: [
			`Confirme seu e-mail pra começar a usar o ${APP_NAME}.`,
			"Depois de tocar no botão, você já entra no app.",
		],
		button: "Confirmar e-mail",
		footnote: "O link vale por 1 hora.",
	});
}

export function resetPasswordEmail(input: EmailInput) {
	return build({
		...input,
		subject: `Crie uma nova senha no ${APP_NAME}`,
		lines: [
			"Recebemos um pedido pra trocar a senha da sua conta.",
			"Toque no botão pra escolher uma nova senha.",
		],
		button: "Criar nova senha",
		footnote: "O link vale por 1 hora e só funciona uma vez.",
	});
}

export function existingAccountEmail(input: EmailInput) {
	return build({
		...input,
		subject: `Você já tem conta no ${APP_NAME}`,
		lines: [
			"Alguém tentou criar uma conta com este e-mail, mas você já tem conta.",
			"Entre com o Google ou, se preferir usar senha, toque em “Esqueci a senha” na tela de entrar.",
		],
		button: "Ir pra tela de entrar",
		footnote: "Nenhuma conta nova foi criada.",
	});
}

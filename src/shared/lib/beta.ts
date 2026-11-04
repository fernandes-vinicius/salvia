// Recursos de IA: fechados, só pra lista de e-mails em `BETA_EMAILS` (o
// fundador testando); com `AI_OPEN=true`, pra todo mundo (com a cota mensal
// do `ai-usage`; o beta continua sem cota do mês). A checagem de verdade é no
// servidor (`canUseAi`/`isBetaUser` em `~/domains/auth/services/beta-service`);
// a UI só esconde.

/** O e-mail está na lista (vírgula, espaço ou quebra de linha; sem caixa)? */
export function isBetaEmail(email: string, list: string | undefined) {
	const target = email.trim().toLowerCase();
	if (!target || !list) return false;
	return list
		.split(/[\s,]+/)
		.some((entry) => entry.trim().toLowerCase() === target);
}

/** A IA está aberta pra todos? Só com `"true"` ou `"1"`; o resto = fechada. */
export function isAiOpen(value: string | undefined) {
	const normalized = value?.trim().toLowerCase();
	return normalized === "true" || normalized === "1";
}

/** Pode usar os recursos de IA: IA aberta ou e-mail do beta. */
export function hasAiAccess(
	email: string,
	env: { betaEmails: string | undefined; aiOpen: string | undefined },
) {
	return isAiOpen(env.aiOpen) || isBetaEmail(email, env.betaEmails);
}

// Recursos em beta (ex.: importar dieta com IA) ficam liberados só pra uma
// lista de e-mails em `BETA_EMAILS`. A checagem de verdade é no servidor
// (`isBetaUser` em `~/domains/auth/services/beta-service`); a UI só esconde.

/** O e-mail está na lista (vírgula, espaço ou quebra de linha; sem caixa)? */
export function isBetaEmail(email: string, list: string | undefined) {
	const target = email.trim().toLowerCase();
	if (!target || !list) return false;
	return list
		.split(/[\s,]+/)
		.some((entry) => entry.trim().toLowerCase() === target);
}

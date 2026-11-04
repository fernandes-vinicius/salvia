const GENERIC = "Não deu pra entrar agora. Tente de novo.";
const BAD_LINK =
	"Esse link venceu ou já foi usado. Peça um novo pra continuar.";

const MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha errados.",
	EMAIL_NOT_VERIFIED:
		"Confirme seu e-mail pra entrar. Mandamos o link de novo, confira a caixa de entrada e o spam.",
	account_not_linked:
		"Esse e-mail tem um cadastro com senha que ainda não foi confirmado. Confirme pelo link que mandamos ou use “Esqueci a senha”.",
	TOKEN_EXPIRED: BAD_LINK,
	INVALID_TOKEN: BAD_LINK,
	USER_NOT_FOUND: BAD_LINK,
	PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
	PASSWORD_TOO_LONG: "A senha pode ter no máximo 128 caracteres.",
	access_denied: "Você cancelou o login com o Google.",
};

/** Mensagem em pt-BR pra um erro do Better Auth (código da API ou da URL). */
export function authErrorMessage({
	code,
	status,
}: {
	code?: string | null;
	status?: number;
}) {
	if (status === 429) {
		return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
	}
	return (code && MESSAGES[code]) ?? GENERIC;
}

import { z } from "zod";

const email = z.string().trim().pipe(z.email("Digite um e-mail válido."));

const newPassword = z
	.string()
	.min(8, "A senha precisa ter pelo menos 8 caracteres.")
	.max(128, "A senha pode ter no máximo 128 caracteres.");

export const signInSchema = z.object({
	email,
	password: z.string().min(1, "Digite sua senha."),
});

export const signUpSchema = z.object({
	name: z.string().trim().min(1, "Digite seu nome.").max(80),
	email,
	password: newPassword,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({ password: newPassword });

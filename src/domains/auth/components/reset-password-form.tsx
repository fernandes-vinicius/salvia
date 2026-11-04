"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	AuthFormError,
	fieldErrors,
} from "~/domains/auth/components/auth-form-error";
import { PasswordInput } from "~/domains/auth/components/password-input";
import { authClient } from "~/domains/auth/lib/auth-client";
import { resetPasswordSchema } from "~/domains/auth/schemas/credentials-schema";
import { authErrorMessage } from "~/domains/auth/utils/auth-errors";
import { Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";

/** `token` vem do link do e-mail; sem ele (link vencido), pede outro. */
export function ResetPasswordForm({ token }: { token: string | null }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, fields] = useForm({
		id: "reset-password",
		constraint: getZodConstraint(resetPasswordSchema),
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: resetPasswordSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success" || !token) return;

			setPending(true);
			setError(null);
			const { error } = await authClient.resetPassword({
				newPassword: submission.value.password,
				token,
			});
			if (error) {
				setPending(false);
				setError(authErrorMessage(error));
				return;
			}
			toast.success("Senha nova salva. Agora é só entrar.");
			router.replace("/login");
		},
	});

	if (!token) {
		return (
			<div className="flex flex-col gap-4">
				<AuthFormError message={authErrorMessage({ code: "INVALID_TOKEN" })} />
				<Button
					size="lg"
					className="w-full"
					nativeButton={false}
					render={<Link href="/esqueci-a-senha" />}
				>
					Pedir um link novo
				</Button>
			</div>
		);
	}

	return (
		<form
			{...getFormProps(form)}
			className="flex flex-col gap-4 text-left"
			noValidate
		>
			<AuthFormError message={error} />
			<FieldGroup className="gap-4">
				<Field>
					<FieldLabel htmlFor={fields.password.id}>Nova senha</FieldLabel>
					<PasswordInput
						{...getInputProps(fields.password, { type: "password" })}
						autoComplete="new-password"
					/>
					<FieldDescription>Pelo menos 8 caracteres.</FieldDescription>
					<FieldError errors={fieldErrors(fields.password.errors)} />
				</Field>
			</FieldGroup>
			<Button type="submit" size="lg" className="w-full" disabled={pending}>
				{pending && (
					<Loader2Icon data-icon="inline-start" className="animate-spin" />
				)}
				Salvar nova senha
			</Button>
		</form>
	);
}

"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useState } from "react";

import {
	AuthFormError,
	fieldErrors,
} from "~/domains/auth/components/auth-form-error";
import { CheckInbox } from "~/domains/auth/components/check-inbox";
import { authClient } from "~/domains/auth/lib/auth-client";
import { forgotPasswordSchema } from "~/domains/auth/schemas/credentials-schema";
import { authErrorMessage } from "~/domains/auth/utils/auth-errors";
import { Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";

// A resposta é sempre a mesma, com ou sem conta: não revela quem é cadastrado.
// Pra quem só entra com Google, o link cria a senha.
export function ForgotPasswordForm() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);

	const [form, fields] = useForm({
		id: "forgot-password",
		constraint: getZodConstraint(forgotPasswordSchema),
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: forgotPasswordSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;

			setPending(true);
			setError(null);
			const { error } = await authClient.requestPasswordReset({
				email: submission.value.email,
				redirectTo: "/redefinir-senha",
			});
			setPending(false);
			if (error?.status === 429) {
				setError(authErrorMessage(error));
				return;
			}
			setSent(true);
		},
	});

	if (sent) {
		return (
			<CheckInbox title="Link a caminho">
				Se houver conta com esse e-mail, mandamos um link pra criar uma nova
				senha
			</CheckInbox>
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
					<FieldLabel htmlFor={fields.email.id}>E-mail</FieldLabel>
					<Input
						{...getInputProps(fields.email, { type: "email" })}
						autoComplete="email"
						inputMode="email"
					/>
					<FieldError errors={fieldErrors(fields.email.errors)} />
				</Field>
			</FieldGroup>
			<Button type="submit" size="lg" className="w-full" disabled={pending}>
				{pending && (
					<Loader2Icon data-icon="inline-start" className="animate-spin" />
				)}
				Mandar link
			</Button>
		</form>
	);
}

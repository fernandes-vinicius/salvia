"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useState } from "react";

import {
	AuthFormError,
	fieldErrors,
} from "~/domains/auth/components/auth-form-error";
import { CheckInbox } from "~/domains/auth/components/check-inbox";
import { PasswordInput } from "~/domains/auth/components/password-input";
import { authClient } from "~/domains/auth/lib/auth-client";
import { signUpSchema } from "~/domains/auth/schemas/credentials-schema";
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
import { Input } from "~/shared/components/ui/input";
import { analytics } from "~/shared/lib/analytics/analytics";

// Com e-mail já cadastrado, o Better Auth responde igual (não revela quem tem
// conta) e manda um aviso pro dono do e-mail.
export function SignUpForm() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sentTo, setSentTo] = useState<string | null>(null);

	const [form, fields] = useForm({
		id: "sign-up",
		constraint: getZodConstraint(signUpSchema),
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: signUpSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;

			setPending(true);
			setError(null);
			const { error } = await authClient.signUp.email({
				...submission.value,
				callbackURL: "/login?verificado=1",
			});
			setPending(false);
			if (error) {
				setError(authErrorMessage(error));
				return;
			}
			analytics.track("conta_criada", { metodo: "email" });
			setSentTo(submission.value.email);
		},
	});

	if (sentTo) {
		return (
			<CheckInbox title="Confira seu e-mail" email={sentTo}>
				Mandamos um link de confirmação pra
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
					<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
					<Input
						{...getInputProps(fields.name, { type: "text" })}
						autoComplete="name"
					/>
					<FieldError errors={fieldErrors(fields.name.errors)} />
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.email.id}>E-mail</FieldLabel>
					<Input
						{...getInputProps(fields.email, { type: "email" })}
						autoComplete="email"
						inputMode="email"
					/>
					<FieldError errors={fieldErrors(fields.email.errors)} />
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.password.id}>Senha</FieldLabel>
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
				Criar conta
			</Button>
		</form>
	);
}

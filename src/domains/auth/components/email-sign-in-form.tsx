"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	AuthFormError,
	fieldErrors,
} from "~/domains/auth/components/auth-form-error";
import { PasswordInput } from "~/domains/auth/components/password-input";
import { authClient } from "~/domains/auth/lib/auth-client";
import { signInSchema } from "~/domains/auth/schemas/credentials-schema";
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

export function EmailSignInForm() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, fields] = useForm({
		id: "email-sign-in",
		constraint: getZodConstraint(signInSchema),
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: signInSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;

			setPending(true);
			setError(null);
			const { error } = await authClient.signIn.email({
				...submission.value,
				callbackURL: "/dashboard",
			});
			if (error) {
				setPending(false);
				setError(authErrorMessage(error));
				return;
			}
			router.replace("/dashboard");
		},
	});

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
				<Field>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<FieldLabel htmlFor={fields.password.id}>Senha</FieldLabel>
						<Link
							href="/esqueci-a-senha"
							className="font-medium text-xs underline underline-offset-4"
						>
							Esqueci a senha
						</Link>
					</div>
					<PasswordInput
						{...getInputProps(fields.password, { type: "password" })}
						autoComplete="current-password"
					/>
					<FieldError errors={fieldErrors(fields.password.errors)} />
				</Field>
			</FieldGroup>
			<Button
				type="submit"
				size="lg"
				variant="secondary"
				className="w-full"
				disabled={pending}
			>
				{pending && (
					<Loader2Icon data-icon="inline-start" className="animate-spin" />
				)}
				Entrar
			</Button>
		</form>
	);
}

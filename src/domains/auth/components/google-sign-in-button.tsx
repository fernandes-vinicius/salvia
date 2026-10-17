"use client";

import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "~/domains/auth/lib/auth-client";
import { GoogleIcon } from "~/shared/components/google-icon";
import { Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

export function GoogleSignInButton() {
	const [isPending, setIsPending] = useState(false);

	async function handleSignIn() {
		setIsPending(true);

		// Em caso de sucesso o navegador é redirecionado pro Google, então o
		// loading só precisa ser desfeito quando a chamada falha.
		const { error } = await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
			errorCallbackURL: "/login",
		});

		if (error) {
			setIsPending(false);
			toast.error("Não foi possível conectar ao Google. Tente novamente.");
		}
	}

	return (
		<Button
			size="lg"
			className="w-full"
			onClick={handleSignIn}
			disabled={isPending}
		>
			{isPending ? (
				<Loader2Icon data-icon="inline-start" className="animate-spin" />
			) : (
				<GoogleIcon data-icon="inline-start" className="size-4" />
			)}
			Entrar com Google
		</Button>
	);
}

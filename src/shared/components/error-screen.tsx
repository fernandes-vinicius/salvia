"use client";

import Link from "next/link";
import { useEffect } from "react";

import { House, RefreshCw, TriangleAlertIcon } from "~/shared/components/icons";
import { StatusScreen } from "~/shared/components/status-screen";
import { Button } from "~/shared/components/ui/button";

interface ErrorScreenProps {
	/** O que foi lançado (pode não ser `Error` quando vem do client). */
	error: unknown;
	retry: () => void;
	/** Pra onde "Voltar pro início" leva (área logada: `/dashboard`). */
	homeHref: string;
	/** Área logada: sugere avisar pelo "Enviar sugestão" (menu do perfil). */
	signedIn?: boolean;
}

/** `digest` = id do erro nos logs do servidor (a mensagem não vem, por segurança). */
function digestOf(error: unknown) {
	if (error instanceof Error && "digest" in error) {
		return typeof error.digest === "string" ? error.digest : null;
	}
	return null;
}

// Conteúdo dos `error.tsx`: explica sem jargão, oferece tentar de novo e
// mostra o código pra quem for avisar pelo "Enviar sugestão".
export function ErrorScreen({
	error,
	retry,
	homeHref,
	signedIn = true,
}: ErrorScreenProps) {
	const digest = digestOf(error);

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<StatusScreen
			icon={TriangleAlertIcon}
			title="Algo deu errado"
			description={
				<>
					{signedIn ? (
						<>
							Não foi nada que você fez. Tente de novo; se continuar, avise pelo{" "}
							<strong>Enviar sugestão</strong>, no menu do perfil.
						</>
					) : (
						"Não foi nada que você fez. Tente de novo; se continuar, tente mais tarde."
					)}
					{digest && (
						<span className="mt-2 block font-mono text-xs">
							Código: {digest}
						</span>
					)}
				</>
			}
		>
			<Button onClick={() => retry()}>
				<RefreshCw data-icon="inline-start" />
				Tentar de novo
			</Button>
			<Button
				variant="outline"
				nativeButton={false}
				render={<Link href={homeHref} />}
			>
				<House data-icon="inline-start" />
				Voltar pro início
			</Button>
		</StatusScreen>
	);
}

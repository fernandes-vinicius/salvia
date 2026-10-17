"use client";

import { useEffect, useState } from "react";

import { Download, Plus, Share, XIcon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { APP_NAME } from "~/shared/lib/app-config";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "salvia:pwa-install-dismissed";

function isIos() {
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		// iOS Safari
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function wasDismissed() {
	try {
		return localStorage.getItem(DISMISS_KEY) !== null;
	} catch {
		return false;
	}
}

function rememberDismiss() {
	try {
		localStorage.setItem(DISMISS_KEY, "1");
	} catch {
		// Sem storage (aba anônima): o aviso volta na próxima visita.
	}
}

// Convite pra instalar o app (mesmo padrão do listify). Android/Chrome:
// captura o `beforeinstallprompt` e mostra "Instalar". iOS Safari (que não
// dispara o evento): instruções de "Adicionar à Tela de Início". Some depois
// de instalar ou dispensar. Fica acima da barra de abas flutuante.
export function InstallPrompt() {
	const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
		null,
	);
	const [showIosHint, setShowIosHint] = useState(false);

	useEffect(() => {
		if (isStandalone() || wasDismissed()) return;

		if (isIos()) {
			setShowIosHint(true);
			return;
		}

		const onPrompt = (event: Event) => {
			event.preventDefault();
			setDeferred(event as BeforeInstallPromptEvent);
		};
		const onInstalled = () => {
			setDeferred(null);
			rememberDismiss();
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);

	function dismiss() {
		rememberDismiss();
		setDeferred(null);
		setShowIosHint(false);
	}

	async function install() {
		if (!deferred) return;
		await deferred.prompt();
		const { outcome } = await deferred.userChoice;
		if (outcome === "accepted") rememberDismiss();
		setDeferred(null);
	}

	if (!deferred && !showIosHint) return null;

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 px-4 print:hidden">
			<section
				aria-label={`Instalar o ${APP_NAME}`}
				className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-3xl bg-card p-3 ring-1 ring-foreground/10"
			>
				{/* biome-ignore lint/performance/noImgElement: ícone estático do PWA, sem otimização necessária */}
				<img
					src="/pwa-192x192.png"
					alt=""
					width={44}
					height={44}
					className="size-11 shrink-0 rounded-2xl"
				/>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-sm leading-tight">
						Instale o {APP_NAME}
					</p>
					{showIosHint ? (
						<p className="mt-0.5 text-muted-foreground text-xs leading-snug">
							Toque em <Share className="inline-block size-3.5 align-[-2px]" />{" "}
							e em{" "}
							<span className="whitespace-nowrap">
								"Adicionar à Tela de Início"
							</span>{" "}
							<Plus className="inline-block size-3.5 align-[-2px]" />
						</p>
					) : (
						<p className="mt-0.5 text-muted-foreground text-xs">
							Abre direto da tela inicial, em tela cheia.
						</p>
					)}
				</div>
				{!showIosHint && (
					<Button size="sm" className="shrink-0" onClick={install}>
						<Download data-icon="inline-start" />
						Instalar
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon-sm"
					className="shrink-0 text-muted-foreground"
					aria-label="Dispensar"
					onClick={dismiss}
				>
					<XIcon />
				</Button>
			</section>
		</div>
	);
}

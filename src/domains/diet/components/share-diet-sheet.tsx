"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	createDietShareAction,
	deleteDietShareAction,
	getDietShareAction,
} from "~/domains/diet/actions/diet-share-actions";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	Copy,
	Link,
	Loader2Icon,
	RotateCcw,
	Share,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { analytics } from "~/shared/lib/analytics/analytics";

interface ShareDietSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type Pending = "create" | "renew" | "delete" | null;

// "Compartilhar dieta" (menu ⋮): link público só de leitura (`/d/:token`)
// que mostra sempre a dieta atual, sem nome nem dados da pessoa.
export function ShareDietSheet({ open, onOpenChange }: ShareDietSheetProps) {
	// undefined = carregando; null = sem link.
	const [token, setToken] = useState<string | null | undefined>(undefined);
	const [pending, setPending] = useState<Pending>(null);

	useEffect(() => {
		if (!open || token !== undefined) return;
		getDietShareAction().then(setToken);
	}, [open, token]);

	const url =
		token && typeof window !== "undefined"
			? new URL(`/d/${token}`, window.location.origin).href
			: null;

	async function create(renew: boolean) {
		setPending(renew ? "renew" : "create");
		const next = await createDietShareAction(renew);
		setPending(null);
		setToken(next);
		analytics.track("dieta_compartilhada", { novo_link: renew });
		if (renew) toast.success("Link novo criado. O anterior parou de abrir.");
	}

	async function remove() {
		setPending("delete");
		await deleteDietShareAction();
		setPending(null);
		setToken(null);
		toast.success("Link desativado.");
	}

	async function copy() {
		if (!url) return;
		await navigator.clipboard.writeText(url);
		toast.success("Link copiado.");
	}

	async function share() {
		if (!url) return;
		try {
			await navigator.share({ title: "Minha dieta no Sálvia", url });
		} catch {
			// Cancelou o compartilhamento: nada a fazer.
		}
	}

	const canShare =
		typeof navigator !== "undefined" && typeof navigator.share === "function";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>Compartilhar dieta</SheetTitle>
					<SheetDescription>
						Um link só de leitura pra mandar pro amigo da academia ou pro seu
						personal. Ele mostra sempre a versão atual, sem seu nome.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-4 p-4">
					{token === undefined ? (
						<Skeleton className="h-9 rounded-4xl" />
					) : url ? (
						<>
							<Input
								readOnly
								value={url}
								aria-label="Link da dieta"
								onFocus={(event) => event.currentTarget.select()}
							/>
							<div className="grid grid-cols-2 gap-2">
								<Button onClick={copy}>
									<Copy data-icon="inline-start" />
									Copiar link
								</Button>
								{canShare ? (
									<Button variant="secondary" onClick={share}>
										<Share data-icon="inline-start" />
										Compartilhar
									</Button>
								) : (
									<Button
										variant="secondary"
										nativeButton={false}
										render={
											// biome-ignore lint/a11y/useAnchorContent: o conteúdo vem do Button
											<a href={url} target="_blank" rel="noreferrer" />
										}
									>
										<Link data-icon="inline-start" />
										Abrir
									</Button>
								)}
							</div>
							<div className="flex flex-wrap justify-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									disabled={pending !== null}
									onClick={() => create(true)}
								>
									{pending === "renew" ? (
										<Loader2Icon
											data-icon="inline-start"
											className="animate-spin"
										/>
									) : (
										<RotateCcw data-icon="inline-start" />
									)}
									Gerar link novo
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-destructive"
									disabled={pending !== null}
									onClick={remove}
								>
									{pending === "delete" && (
										<Loader2Icon
											data-icon="inline-start"
											className="animate-spin"
										/>
									)}
									Desativar link
								</Button>
							</div>
						</>
					) : (
						<Button disabled={pending !== null} onClick={() => create(false)}>
							{pending === "create" ? (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							) : (
								<Link data-icon="inline-start" />
							)}
							Criar link
						</Button>
					)}
				</div>
			</BottomSheetContent>
		</Sheet>
	);
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAccountAction } from "~/domains/auth/actions/delete-account-action";
import { FormSection } from "~/shared/components/form-section";
import { Loader2Icon, Trash2 } from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";

// "Excluir conta" em Configurações: apaga o usuário e todos os dados dele,
// com confirmação. Depois volta pra landing.
export function DeleteAccount() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);

	async function handleDelete() {
		setPending(true);
		const result = await deleteAccountAction();
		if (!result.ok) {
			setPending(false);
			toast.error(result.error);
			return;
		}
		analytics.reset();
		toast.success("Conta excluída. Seus dados foram apagados.");
		router.replace("/");
	}

	return (
		<FormSection
			title="Conta"
			description="Excluir a conta apaga perfil, metas, dieta, alimentos e medidas. Não dá pra desfazer."
		>
			<div>
				<Button variant="destructive" onClick={() => setOpen(true)}>
					<Trash2 data-icon="inline-start" />
					Excluir conta
				</Button>
			</div>

			<AlertDialog
				open={open}
				onOpenChange={(next) => !pending && setOpen(next)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
						<AlertDialogDescription>
							Todos os seus dados serão apagados agora: perfil, metas, dieta,
							alimentos cadastrados e medidas. Isso não pode ser desfeito.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
						<Button
							variant="destructive"
							disabled={pending}
							onClick={handleDelete}
						>
							{pending && (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							)}
							Excluir conta
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</FormSection>
	);
}

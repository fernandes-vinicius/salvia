"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
	shareRecipeAction,
	unshareRecipeAction,
} from "~/domains/meal-recipe/actions/saved-recipe-actions";
import {
	recipeShareMessage,
	whatsappShareUrl,
} from "~/domains/meal-recipe/utils/recipe-share";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	Copy,
	Link,
	Link2Off,
	Loader2Icon,
	MessageCircle,
	Share,
} from "~/shared/components/icons";
import { Button, buttonVariants } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { cn } from "~/shared/lib/utils";

interface RecipeShareSheetProps {
	/** Receita salva a compartilhar; null = fechado. */
	recipe: { id: string; title: string; minutes: number } | null;
	/** Texto completo da receita (botão "Copiar receita"). */
	text: string;
	onOpenChange: (open: boolean) => void;
	/** Link ligado (token) ou desligado (null), pra atualizar a lista. */
	onShareChange?: (recipeId: string, token: string | null) => void;
}

// "Compartilhar receita": liga o link público (`/r/:token`) ao abrir e
// oferece WhatsApp, o menu de compartilhar do celular (Instagram, LinkedIn…),
// copiar link/texto e desativar o link.
export function RecipeShareSheet({
	recipe,
	text,
	onOpenChange,
	onShareChange,
}: RecipeShareSheetProps) {
	return (
		<Sheet open={recipe !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="sm:max-w-lg">
				<SheetHeader className="text-center">
					<SheetTitle>Compartilhar receita</SheetTitle>
					<SheetDescription>
						Quem tiver o link vê a receita, sem o seu nome nem a sua dieta.
					</SheetDescription>
				</SheetHeader>
				{recipe && (
					<ShareFlow
						key={recipe.id}
						recipe={recipe}
						text={text}
						onClose={() => onOpenChange(false)}
						onShareChange={onShareChange}
					/>
				)}
			</BottomSheetContent>
		</Sheet>
	);
}

function ShareFlow({
	recipe,
	text,
	onClose,
	onShareChange,
}: {
	recipe: NonNullable<RecipeShareSheetProps["recipe"]>;
	text: string;
	onClose: () => void;
	onShareChange?: RecipeShareSheetProps["onShareChange"];
}) {
	const [url, setUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [disabling, setDisabling] = useState(false);
	const [canShare, setCanShare] = useState(false);
	const started = useRef(false);

	// Liga o link ao abrir (o ref evita pedir duas vezes no StrictMode).
	useEffect(() => {
		if (started.current) return;
		started.current = true;
		setCanShare(typeof navigator.share === "function");
		shareRecipeAction(recipe.id).then((result) => {
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setUrl(result.data.url);
			onShareChange?.(recipe.id, result.data.token);
		});
	});

	async function copy(value: string, done: string) {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(done);
		} catch {
			toast.error("Não foi possível copiar.");
		}
	}

	async function handleNativeShare(link: string) {
		try {
			await navigator.share({
				title: recipe.title,
				text: recipeShareMessage(recipe, link).replace(`\n${link}`, ""),
				url: link,
			});
		} catch {
			// Cancelado pela pessoa: nada a fazer.
		}
	}

	async function handleDisable() {
		setDisabling(true);
		const result = await unshareRecipeAction(recipe.id);
		setDisabling(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		onShareChange?.(recipe.id, null);
		toast.success(
			"Link desativado. Quem tinha o endereço não vê mais a receita.",
		);
		onClose();
	}

	if (error) {
		return (
			<p role="alert" className="p-4 text-sm">
				{error}
			</p>
		);
	}

	if (!url) {
		return (
			<output className="flex items-center justify-center gap-2 p-8 text-muted-foreground text-sm">
				<Loader2Icon className="size-4 animate-spin" aria-hidden />
				Criando o link…
			</output>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4">
			<a
				href={whatsappShareUrl(recipeShareMessage(recipe, url))}
				target="_blank"
				rel="noopener noreferrer"
				className={cn(buttonVariants(), "w-full")}
			>
				<MessageCircle data-icon="inline-start" />
				Enviar no WhatsApp
			</a>
			{canShare && (
				<Button variant="outline" onClick={() => handleNativeShare(url)}>
					<Share data-icon="inline-start" />
					Mais opções (Instagram, LinkedIn…)
				</Button>
			)}
			<div className="flex gap-2">
				<Input
					readOnly
					value={url}
					aria-label="Link da receita"
					onFocus={(event) => event.currentTarget.select()}
					className="min-w-0 flex-1"
				/>
				<Button
					variant="outline"
					aria-label="Copiar link"
					onClick={() => copy(url, "Link copiado.")}
				>
					<Link />
				</Button>
			</div>
			<Button variant="ghost" onClick={() => copy(text, "Receita copiada.")}>
				<Copy data-icon="inline-start" />
				Copiar a receita em texto
			</Button>
			<Button
				variant="ghost"
				className="text-destructive"
				disabled={disabling}
				onClick={handleDisable}
			>
				{disabling ? (
					<Loader2Icon data-icon="inline-start" className="animate-spin" />
				) : (
					<Link2Off data-icon="inline-start" />
				)}
				Desativar link
			</Button>
		</div>
	);
}

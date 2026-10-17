"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { applyDietTemplateAction } from "~/domains/diet-templates/actions/diet-template-actions";
import type { DietTemplatePreview } from "~/domains/diet-templates/types/diet-template-preview";
import { MacroLine } from "~/domains/food/components/macro-line";
import { Loader2Icon, Sparkles } from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

interface DietTemplatesProps {
	templates: DietTemplatePreview[];
	/** Refeições na dieta atual (avisa que vão ser substituídas). */
	currentMealCount: number;
	hasCurrentFoods: boolean;
}

// Dietas prontas: um toque cria a dieta inteira, já com as quantidades
// ajustadas às metas da pessoa (TMB + Meta). Substitui a dieta atual, então
// pede confirmação.
export function DietTemplates({
	templates,
	currentMealCount,
	hasCurrentFoods,
}: DietTemplatesProps) {
	const router = useRouter();
	const [confirming, setConfirming] = useState<DietTemplatePreview | null>(
		null,
	);
	const [pending, setPending] = useState(false);

	async function apply(template: DietTemplatePreview) {
		setPending(true);
		const result = await applyDietTemplateAction(template.id);
		if (!result.ok) {
			setPending(false);
			toast.error(result.error);
			return;
		}
		toast.success(
			result.personalized
				? `${template.name} criada com as suas metas.`
				: `${template.name} criada. Preencha TMB e Meta pra ajustar as quantidades.`,
		);
		router.push("/dieta");
	}

	return (
		<section aria-labelledby="dietas-prontas" className="flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<h2
					id="dietas-prontas"
					className="flex items-center gap-2 font-heading font-semibold"
				>
					<Sparkles className="size-4 text-primary" />
					Dietas prontas
				</h2>
				<p className="text-muted-foreground text-sm">
					Escolha um modelo e a dieta é montada com as quantidades certas pra
					você. Depois é só ajustar.
				</p>
			</div>

			<ul className="grid gap-3 sm:grid-cols-2">
				{templates.map((template) => (
					<li
						key={template.id}
						className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
					>
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-heading font-semibold">{template.name}</h3>
							<Badge variant="secondary">{template.tag}</Badge>
						</div>
						<p className="text-pretty text-muted-foreground text-sm">
							{template.description}
						</p>
						<div className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3">
							<p className="text-muted-foreground text-xs">
								{template.personalized
									? "Pra você"
									: "Quantidades de referência"}{" "}
								· {template.mealCount} refeições
							</p>
							<p className="font-heading font-semibold tabular-nums">
								~{formatNumber(template.kcal)} kcal
							</p>
							<MacroLine macros={template.macros} />
						</div>
						<Button className="mt-auto" onClick={() => setConfirming(template)}>
							Usar esta dieta
						</Button>
					</li>
				))}
			</ul>

			<AlertDialog
				open={confirming !== null}
				onOpenChange={(open) => !open && !pending && setConfirming(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Usar {confirming?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							{hasCurrentFoods
								? `Sua dieta atual (${currentMealCount} ${currentMealCount === 1 ? "refeição" : "refeições"}) será substituída por esta. Isso não pode ser desfeito.`
								: "A dieta será montada com as refeições e alimentos do modelo."}{" "}
							{confirming?.personalized
								? "As quantidades já vêm ajustadas às suas metas."
								: "Preencha TMB e Meta depois pra ajustar as quantidades."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
						<Button
							disabled={pending}
							onClick={() => confirming && apply(confirming)}
						>
							{pending && (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							)}
							Usar dieta
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}

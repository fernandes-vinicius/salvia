"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DietPreview } from "~/domains/diet/components/diet-preview";
import { applyDietTemplateAction } from "~/domains/diet-templates/actions/diet-template-actions";
import type { DietTemplatePreview } from "~/domains/diet-templates/types/diet-template-preview";
import { MacroLine } from "~/domains/food/components/macro-line";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Eye, Loader2Icon, Sparkles } from "~/shared/components/icons";
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
import {
	Sheet,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { formatNumber } from "~/shared/lib/format";

interface DietTemplatesProps {
	templates: DietTemplatePreview[];
	/** Refeições na dieta atual (avisa que vão ser substituídas). */
	currentMealCount: number;
	hasCurrentFoods: boolean;
}

// Dietas prontas: um toque cria a dieta inteira, já com as quantidades
// ajustadas às metas da pessoa (TMB + Meta). Substitui a dieta atual, então
// pede confirmação. "Visualizar" mostra a dieta montada antes de decidir.
export function DietTemplates({
	templates,
	currentMealCount,
	hasCurrentFoods,
}: DietTemplatesProps) {
	const router = useRouter();
	const [confirming, setConfirming] = useState<DietTemplatePreview | null>(
		null,
	);
	const [viewing, setViewing] = useState<DietTemplatePreview | null>(null);
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
					Modelos de exemplo com as quantidades recalculadas pras metas que você
					definiu. Não são prescrição: use como ponto de partida e ajuste como
					quiser.
				</p>
			</div>

			{/* Uma embaixo da outra em todas as telas (lado a lado ficava apertado). */}
			<ul className="flex flex-col gap-3">
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
									? "Nas suas metas"
									: "Quantidades de referência"}{" "}
								· {template.mealCount} refeições
							</p>
							<p className="font-heading font-semibold tabular-nums">
								~{formatNumber(template.kcal)} kcal
							</p>
							<MacroLine macros={template.macros} />
						</div>
						<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
							<Button variant="secondary" onClick={() => setViewing(template)}>
								<Eye data-icon="inline-start" />
								Visualizar
							</Button>
							<Button onClick={() => setConfirming(template)}>
								Usar esta dieta
							</Button>
						</div>
					</li>
				))}
			</ul>

			<Sheet
				open={viewing !== null}
				onOpenChange={(open) => !open && setViewing(null)}
			>
				<BottomSheetContent className="max-w-2xl">
					<SheetHeader className="text-center">
						<SheetTitle>{viewing?.name}</SheetTitle>
						<SheetDescription>
							{viewing?.personalized
								? "Modelo de exemplo, recalculado pras suas metas"
								: "Modelo de exemplo com quantidades de referência (preencha TMB e Meta pra ajustar)"}
						</SheetDescription>
						{viewing && (
							<div className="flex flex-col items-center gap-1 pt-1">
								<p className="font-heading font-semibold tabular-nums">
									~{formatNumber(viewing.kcal)} kcal · {viewing.mealCount}{" "}
									refeições
								</p>
								<MacroLine macros={viewing.macros} />
							</div>
						)}
					</SheetHeader>
					<div className="flex-1 overflow-y-auto bg-background px-4 py-4 md:px-6">
						{viewing && <DietPreview meals={viewing.meals} />}
					</div>
					<SheetFooter>
						<Button
							size="lg"
							onClick={() => {
								setConfirming(viewing);
								setViewing(null);
							}}
						>
							Usar esta dieta
						</Button>
					</SheetFooter>
				</BottomSheetContent>
			</Sheet>

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
								? "As quantidades são recalculadas pras metas que você definiu; confira e ajuste como quiser."
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

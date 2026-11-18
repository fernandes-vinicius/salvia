"use client";

import { useId, useState } from "react";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { dayMacros } from "~/domains/diet/utils/diet";
import type { DraftDiff } from "~/domains/diet/utils/diet-draft";
import { kcalFor } from "~/domains/food/utils/food";
import {
	countedProtein,
	PROTEIN_LABELS,
	type ProteinCounting,
} from "~/domains/goal/utils/protein-counting";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Loader2Icon, Pencil } from "~/shared/components/icons";
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
import { Checkbox } from "~/shared/components/ui/checkbox";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { formatNumber } from "~/shared/lib/format";

interface DraftBarProps {
	/** A dieta que vale (pra comparar). */
	base: DietMeal[];
	/** O rascunho como está agora na tela. */
	meals: DietMeal[];
	diff: DraftDiff;
	proteinCounting: ProteinCounting;
	/** Usa o rascunho; devolve se deu certo. */
	onApply: (keepPrevious: boolean) => Promise<boolean>;
	onDiscard: () => Promise<boolean>;
}

function totals(meals: DietMeal[], counting: ProteinCounting) {
	const macros = dayMacros(meals);
	return {
		kcal: kcalFor(macros),
		protein: countedProtein(macros, counting),
		carbs: macros.carbs,
		fat: macros.fat,
	};
}

/** "+59", "−12" ou "0" (arredondado). */
function signed(value: number) {
	const rounded = Math.round(value);
	if (rounded === 0) return "0";
	return `${rounded > 0 ? "+" : "−"}${formatNumber(Math.abs(rounded))}`;
}

// Faixa do rascunho, no topo da Dieta: avisa que nada muda até usar, mostra
// a diferença pra dieta atual e leva a "Descartar" / "Usar este rascunho"
// (com a lista do que muda antes de confirmar).
export function DraftBar({
	base,
	meals,
	diff,
	proteinCounting,
	onApply,
	onDiscard,
}: DraftBarProps) {
	const [applyOpen, setApplyOpen] = useState(false);
	const [discardOpen, setDiscardOpen] = useState(false);
	const [keepPrevious, setKeepPrevious] = useState(true);
	const [busy, setBusy] = useState(false);
	const keepId = useId();

	const before = totals(base, proteinCounting);
	const after = totals(meals, proteinCounting);
	const deltas = [
		{ label: "kcal", value: after.kcal - before.kcal, className: "" },
		{
			label: PROTEIN_LABELS[proteinCounting].column,
			value: after.protein - before.protein,
			className: "text-macro-protein-ink",
		},
		{
			label: "C",
			value: after.carbs - before.carbs,
			className: "text-macro-carb-ink",
		},
		{
			label: "G",
			value: after.fat - before.fat,
			className: "text-macro-fat-ink",
		},
	];

	async function run(action: () => Promise<boolean>, close: () => void) {
		setBusy(true);
		const ok = await action();
		setBusy(false);
		if (ok) close();
	}

	return (
		<section
			aria-label="Rascunho da dieta"
			className="flex flex-col gap-3 rounded-3xl bg-secondary p-4 text-secondary-foreground print:hidden"
		>
			<div className="flex items-start gap-3">
				<Pencil className="mt-0.5 size-4 shrink-0" aria-hidden />
				<p className="text-sm">
					Você está mexendo num <strong>rascunho</strong>. Sua dieta, o check-in
					e a lista de compras não mudam até você usar.
				</p>
			</div>
			<dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums">
				<dt className="sr-only">Diferença pra dieta atual</dt>
				{deltas.map((delta) => (
					<dd key={delta.label} className="flex gap-1">
						<span className="font-semibold">{signed(delta.value)}</span>
						<span className={delta.className}>{delta.label}</span>
					</dd>
				))}
				<dd className="text-secondary-foreground/90">vs atual</dd>
			</dl>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="outline"
					className="bg-card"
					onClick={() => setDiscardOpen(true)}
				>
					Descartar
				</Button>
				<Button disabled={diff.count === 0} onClick={() => setApplyOpen(true)}>
					Usar este rascunho
					{diff.count > 0 && (
						<span className="rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums">
							{diff.count}
						</span>
					)}
				</Button>
			</div>

			<Sheet
				open={applyOpen}
				onOpenChange={(open) => !busy && setApplyOpen(open)}
			>
				<BottomSheetContent className="sm:max-w-lg">
					<SheetHeader>
						<SheetTitle>Usar este rascunho?</SheetTitle>
						<SheetDescription>
							Ele vira a sua dieta. O check-in de hoje e os suplementos ligados
							às refeições continuam valendo.
						</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
						<div className="flex flex-col gap-3 rounded-2xl bg-muted p-4">
							{diff.groups.map((group, index) => (
								<div
									key={`${index}-${group.meal}`}
									className="flex flex-col gap-0.5"
								>
									<p className="font-medium text-sm">{group.meal}</p>
									<ul className="text-sm tabular-nums">
										{group.lines.map((line, index) => (
											<li key={`${index}-${line}`}>{line}</li>
										))}
									</ul>
								</div>
							))}
							<p className="flex justify-between gap-3 border-border border-t pt-2 text-sm tabular-nums">
								<span className="text-muted-foreground">Total do dia</span>
								<strong>
									{formatNumber(before.kcal)} → {formatNumber(after.kcal)} kcal
								</strong>
							</p>
						</div>
						<div className="flex items-start gap-3">
							<Checkbox
								id={keepId}
								checked={keepPrevious}
								onCheckedChange={(checked) => setKeepPrevious(checked)}
								className="mt-0.5"
							/>
							<label htmlFor={keepId} className="flex flex-col text-sm">
								<span className="font-medium">
									Guardar a dieta atual pra poder voltar
								</span>
								<span className="text-muted-foreground">
									Fica em ⋮ → “Voltar à dieta anterior”.
								</span>
							</label>
						</div>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<Button
								variant="outline"
								size="lg"
								disabled={busy}
								onClick={() => setApplyOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								size="lg"
								disabled={busy}
								onClick={() =>
									run(
										() => onApply(keepPrevious),
										() => setApplyOpen(false),
									)
								}
							>
								{busy && (
									<Loader2Icon
										data-icon="inline-start"
										className="animate-spin"
									/>
								)}
								Usar rascunho
							</Button>
						</div>
					</div>
				</BottomSheetContent>
			</Sheet>

			<AlertDialog
				open={discardOpen}
				onOpenChange={(open) => !busy && setDiscardOpen(open)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Descartar o rascunho?</AlertDialogTitle>
						<AlertDialogDescription>
							As mudanças do rascunho somem. Sua dieta atual continua igual.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>
							Continuar mexendo
						</AlertDialogCancel>
						<Button
							variant="destructive"
							disabled={busy}
							onClick={() => run(onDiscard, () => setDiscardOpen(false))}
						>
							Descartar
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}

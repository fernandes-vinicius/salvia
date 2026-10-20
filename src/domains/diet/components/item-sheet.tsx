"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateItemQuantityAction } from "~/domains/diet/actions/diet-actions";
import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import {
	type Equivalent,
	equivalentQuantity,
	MAX_ITEM_OPTIONS,
	type SwapMacro,
} from "~/domains/diet/utils/diet";
import {
	CustomFoodForm,
	defaultQuantityFor,
	type Food,
	FoodSearch,
	MacroLine,
	macrosFor,
	QuantityEditor,
	UNIT_LABELS,
} from "~/domains/food";
import {
	SwapCostBadge,
	SwapCostLine,
} from "~/domains/shopping/components/prices-context";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	ArrowLeftRight,
	ChevronLeft,
	Copy,
	Loader2Icon,
	Plus,
	Trash2,
	XIcon,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { useAutosave } from "~/shared/hooks/use-autosave";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface ItemSheetProps {
	item: DietItem | null;
	/** Destinos do "Copiar para" (todas as refeições, inclusive a do item). */
	meals: DietMeal[];
	onOpenChange: (open: boolean) => void;
	/** O item não existe mais no servidor (mudou em outra aba/aparelho). */
	onStale: () => void;
	onQuantityChange: (itemId: string, quantity: number) => void;
	onReplace: (itemId: string, food: Food, quantity: number) => Promise<boolean>;
	onCopy: (itemId: string, mealId: string) => Promise<boolean>;
	onAddOption: (
		itemId: string,
		food: Food,
		quantity: number,
	) => Promise<boolean>;
	onRemoveOption: (itemId: string, optionId: string) => void;
	onSwapOption: (itemId: string, optionId: string) => Promise<boolean>;
	onDelete: (itemId: string) => void;
}

/** Buscar outro alimento pra substituir o item ou pra virar uma opção. */
type FlowMode = "replace" | "option";

type SwapStep =
	| { kind: "search" }
	| { kind: "create"; name: string }
	| {
			kind: "quantity";
			food: Food;
			quantity: number;
			equivalent: Equivalent | null;
	  };

const FLOW_TITLES: Record<FlowMode, string> = {
	replace: "Substituir alimento",
	option: "Adicionar opção",
};

export function ItemSheet({ item, ...props }: ItemSheetProps) {
	// A busca fica presa ao item: abrir outro alimento volta pra edição.
	const [swap, setSwap] = useState<{
		itemId: string;
		mode: FlowMode;
		step: SwapStep;
	} | null>(null);
	const active = item && swap?.itemId === item.id ? swap : null;
	const step = active?.step ?? null;
	const mode = active?.mode ?? "replace";

	return (
		<Sheet open={item !== null} onOpenChange={props.onOpenChange}>
			<BottomSheetContent
				className={cn(
					step &&
						"data-[side=bottom]:h-[90svh] sm:data-[side=bottom]:h-[80svh]",
				)}
			>
				<SheetHeader className="text-center">
					<SheetTitle>
						{step ? FLOW_TITLES[mode] : (item?.food.name ?? "Alimento")}
					</SheetTitle>
					<SheetDescription>
						{step
							? mode === "option"
								? `Pra comer no lugar de ${item?.food.name}, quando quiser`
								: `No lugar de ${item?.food.name}`
							: item?.food.source === "taco"
								? "Tabela TACO"
								: "Alimento cadastrado por você"}
					</SheetDescription>
				</SheetHeader>
				{item &&
					(step ? (
						<SwapFlow
							key={`${item.id}-${mode}`}
							item={item}
							mode={mode}
							step={step}
							onStep={(next) =>
								setSwap(next && { itemId: item.id, mode, step: next })
							}
							onConfirm={async (food, quantity) => {
								if (mode === "replace") {
									return props.onReplace(item.id, food, quantity);
								}
								const ok = await props.onAddOption(item.id, food, quantity);
								// Volta pro painel do item, já com a opção na lista.
								if (ok) setSwap(null);
								return ok;
							}}
						/>
					) : (
						<ItemEditor
							key={item.id}
							item={item}
							{...props}
							onStartFlow={(nextMode) =>
								setSwap({
									itemId: item.id,
									mode: nextMode,
									step: { kind: "search" },
								})
							}
						/>
					))}
			</BottomSheetContent>
		</Sheet>
	);
}

// Quantidade salva sozinha (autosave com debounce; o pendente é salvo ao
// fechar o painel ou ir pra troca, que desmontam este componente).
function ItemEditor({
	item,
	meals,
	onStale,
	onQuantityChange,
	onCopy,
	onRemoveOption,
	onSwapOption,
	onDelete,
	onStartFlow,
}: Omit<
	ItemSheetProps,
	"item" | "onOpenChange" | "onReplace" | "onAddOption"
> & {
	item: DietItem;
	onStartFlow: (mode: FlowMode) => void;
}) {
	const [copyingTo, setCopyingTo] = useState<string | null>(null);
	const [swappingOption, setSwappingOption] = useState<string | null>(null);
	const { status, schedule } = useAutosave<number>({
		save: async (quantity) => {
			const result = await updateItemQuantityAction(item.id, quantity);
			if (!result.ok && result.stale) {
				// O painel fecha e a tela recarrega; não mostra o toast de erro
				// do autosave além do aviso de atualização.
				onStale();
				return true;
			}
			return result.ok;
		},
	});

	useEffect(() => {
		if (status === "error") {
			toast.error("Não foi possível salvar a quantidade. Tente de novo.");
		}
	}, [status]);

	return (
		<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
			<MacroLine macros={macrosFor(item.food, item.quantity)} />
			<QuantityEditor
				unit={item.food.unit}
				name={item.food.name}
				value={item.quantity}
				onChange={(quantity) => {
					onQuantityChange(item.id, quantity);
					schedule(quantity);
				}}
			/>

			{/* Opções: alternativas pra comer no lugar ("ou 1 banana"). */}
			<section className="flex flex-col gap-2" aria-labelledby="item-options">
				<div className="flex items-baseline justify-between gap-2">
					<h3
						id="item-options"
						className="font-medium text-muted-foreground text-xs"
					>
						Opções
					</h3>
					<span className="text-muted-foreground text-xs">
						Não entram nos totais
					</span>
				</div>
				{item.options.length > 0 && (
					<ul className="flex flex-col gap-2">
						{item.options.map((option) => (
							<li
								key={option.id}
								className="flex items-center gap-2 rounded-2xl bg-muted/50 p-3"
							>
								<div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
									<span className="truncate">
										<span className="font-medium text-primary">ou </span>
										{option.food.name}
									</span>
									<span className="flex flex-wrap gap-x-2 text-muted-foreground text-xs tabular-nums">
										<span>
											{formatNumber(option.quantity, 1)}{" "}
											{UNIT_LABELS[option.food.unit].short}
										</span>
										<SwapCostBadge from={item} to={option} />
									</span>
									<MacroLine macros={macrosFor(option.food, option.quantity)} />
								</div>
								<Button
									size="sm"
									variant="secondary"
									disabled={swappingOption !== null}
									onClick={async () => {
										setSwappingOption(option.id);
										await onSwapOption(item.id, option.id);
										setSwappingOption(null);
									}}
								>
									{swappingOption === option.id && (
										<Loader2Icon
											data-icon="inline-start"
											className="animate-spin"
										/>
									)}
									Usar esta
								</Button>
								<Button
									size="icon-sm"
									variant="ghost"
									aria-label={`Remover a opção ${option.food.name}`}
									onClick={() => onRemoveOption(item.id, option.id)}
								>
									<XIcon />
								</Button>
							</li>
						))}
					</ul>
				)}
				{item.options.length < MAX_ITEM_OPTIONS && (
					<Button
						variant="outline"
						size="sm"
						className="self-start"
						onClick={() => onStartFlow("option")}
					>
						<Plus data-icon="inline-start" />
						{item.options.length === 0
							? "Adicionar opção"
							: "Adicionar outra opção"}
					</Button>
				)}
			</section>

			<Button variant="secondary" onClick={() => onStartFlow("replace")}>
				<ArrowLeftRight data-icon="inline-start" />
				Substituir por outro alimento
			</Button>

			{/* Copia com a mesma quantidade, no fim da refeição escolhida. */}
			<section className="flex flex-col gap-2" aria-labelledby="copy-to">
				<h3
					id="copy-to"
					className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs"
				>
					<Copy className="size-3.5" />
					Copiar para
				</h3>
				<div className="flex flex-wrap gap-2">
					{meals.map((meal) => (
						<Button
							key={meal.id}
							size="sm"
							variant="outline"
							disabled={copyingTo !== null}
							onClick={async () => {
								setCopyingTo(meal.id);
								const ok = await onCopy(item.id, meal.id);
								if (!ok) setCopyingTo(null);
							}}
						>
							{copyingTo === meal.id && (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							)}
							{meal.name}
						</Button>
					))}
				</div>
			</section>

			<Button
				variant="destructive"
				className="mt-auto"
				onClick={() => onDelete(item.id)}
			>
				<Trash2 data-icon="inline-start" />
				Remover da refeição
			</Button>
		</div>
	);
}

const MACRO_NAMES: Record<SwapMacro, string> = {
	protein: "proteína",
	carbs: "carboidrato",
	fat: "gordura",
};

function SwapFlow({
	item,
	mode,
	step,
	onStep,
	onConfirm,
}: {
	item: DietItem;
	mode: FlowMode;
	step: SwapStep;
	onStep: (step: SwapStep | null) => void;
	onConfirm: (food: Food, quantity: number) => Promise<boolean>;
}) {
	const [pending, setPending] = useState(false);

	// Sugere a quantidade que mantém o macro principal do item; sem
	// equivalência possível, a porção padrão.
	const pick = (food: Food) => {
		const equivalent = equivalentQuantity(item, food);
		onStep({
			kind: "quantity",
			food,
			quantity: equivalent?.quantity ?? defaultQuantityFor(food.unit),
			equivalent,
		});
	};

	if (step.kind === "create") {
		return (
			<div className="flex-1 overflow-y-auto p-4">
				<CustomFoodForm
					defaultName={step.name}
					onSaved={pick}
					onCancel={() => onStep({ kind: "search" })}
				/>
			</div>
		);
	}

	if (step.kind === "quantity") {
		const { food, quantity, equivalent } = step;
		const short = UNIT_LABELS[item.food.unit].short;
		return (
			<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 self-start"
					onClick={() => onStep({ kind: "search" })}
				>
					<ChevronLeft data-icon="inline-start" />
					Outro alimento
				</Button>

				<dl className="grid gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
					<div className="flex flex-col gap-0.5">
						<dt className="text-muted-foreground text-xs">
							{mode === "option" ? "Na dieta" : "Sai"} ·{" "}
							{formatNumber(item.quantity, 1)} {short}
						</dt>
						<dd className="flex flex-col gap-0.5">
							<span
								className={cn(
									mode === "replace" &&
										"line-through decoration-muted-foreground/60",
								)}
							>
								{item.food.name}
							</span>
							<MacroLine macros={macrosFor(item.food, item.quantity)} />
						</dd>
					</div>
					<div className="flex flex-col gap-0.5">
						<dt className="text-muted-foreground text-xs">
							{mode === "option" ? "Ou" : "Entra"} · {formatNumber(quantity, 1)}{" "}
							{UNIT_LABELS[food.unit].short}
						</dt>
						<dd className="flex flex-col gap-0.5">
							<span className="font-medium">{food.name}</span>
							<MacroLine macros={macrosFor(food, quantity)} />
						</dd>
					</div>
				</dl>

				<SwapCostLine from={item} to={{ food, quantity }} />

				{equivalent && (
					<p className="text-muted-foreground text-xs">
						Sugerimos a quantidade com os mesmos{" "}
						{formatNumber(equivalent.grams)} g de{" "}
						{MACRO_NAMES[equivalent.macro]} de {item.food.name}. Ajuste se
						quiser.
					</p>
				)}

				<QuantityEditor
					unit={food.unit}
					name={food.name}
					value={quantity}
					onChange={(next) => onStep({ ...step, quantity: next })}
				/>
				<Button
					disabled={pending}
					onClick={async () => {
						setPending(true);
						const ok = await onConfirm(food, quantity);
						if (!ok) setPending(false);
					}}
				>
					{pending && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					{mode === "option" ? "Adicionar opção" : "Substituir"}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
			<Button
				variant="ghost"
				size="sm"
				className="-ml-2 self-start"
				onClick={() => onStep(null)}
			>
				<ChevronLeft data-icon="inline-start" />
				Voltar
			</Button>
			<FoodSearch
				onSelect={pick}
				onCreate={(name) => onStep({ kind: "create", name })}
			/>
		</div>
	);
}

"use client";

import { useState } from "react";

import type { ImportedPortion } from "~/domains/diet-import/types/diet-import-types";
import { importedQuantity } from "~/domains/diet-import/utils/diet-import";
import {
	CustomFoodForm,
	type Food,
	FoodSearch,
	MacroLine,
	macrosFor,
	QuantityEditor,
} from "~/domains/food";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { ArrowLeftRight, Trash2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface PortionSheetProps {
	portion: ImportedPortion | null;
	onOpenChange: (open: boolean) => void;
	onChange: (portion: ImportedPortion) => void;
	onRemove: () => void;
}

// Corrigir um alimento lido: trocar pelo certo (busca na base ou cadastro),
// ajustar a quantidade ou tirar da dieta importada.
export function PortionSheet({
	portion,
	onOpenChange,
	onChange,
	onRemove,
}: PortionSheetProps) {
	return (
		<Sheet open={portion !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[90svh] sm:data-[side=bottom]:h-[80svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Conferir alimento</SheetTitle>
					<SheetDescription>Lido: “{portion?.text}”</SheetDescription>
				</SheetHeader>
				{portion && (
					<PortionFlow
						key={portion.key}
						portion={portion}
						onChange={onChange}
						onRemove={onRemove}
					/>
				)}
			</BottomSheetContent>
		</Sheet>
	);
}

type Step = "edit" | "search" | { create: string };

function PortionFlow({
	portion,
	onChange,
	onRemove,
}: Omit<PortionSheetProps, "portion" | "onOpenChange"> & {
	portion: ImportedPortion;
}) {
	const [step, setStep] = useState<Step>(portion.food ? "edit" : "search");

	const pick = (food: Food) => {
		onChange({
			...portion,
			food,
			quantity: importedQuantity(food.unit, portion.read),
		});
		setStep("edit");
	};

	if (typeof step === "object") {
		return (
			<div className="flex-1 overflow-y-auto p-4">
				<CustomFoodForm
					defaultName={step.create}
					onSaved={pick}
					onCancel={() => setStep("search")}
				/>
			</div>
		);
	}

	if (step === "search" || !portion.food) {
		return (
			<div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
				<FoodSearch
					onSelect={pick}
					onCreate={(name) => setStep({ create: name })}
				/>
				<Button variant="ghost" className="text-destructive" onClick={onRemove}>
					<Trash2 data-icon="inline-start" />
					Tirar da dieta
				</Button>
			</div>
		);
	}

	const { food, quantity } = portion;
	return (
		<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
			<div className="flex flex-col gap-1">
				<p className="font-heading font-semibold">{food.name}</p>
				<MacroLine macros={macrosFor(food, quantity)} />
			</div>
			<QuantityEditor
				unit={food.unit}
				name={food.name}
				value={quantity}
				onChange={(next) => onChange({ ...portion, quantity: next })}
			/>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button
					variant="outline"
					className="sm:flex-1"
					onClick={() => setStep("search")}
				>
					<ArrowLeftRight data-icon="inline-start" />
					Trocar alimento
				</Button>
				<Button
					variant="ghost"
					className="text-destructive sm:flex-1"
					onClick={onRemove}
				>
					<Trash2 data-icon="inline-start" />
					Tirar da dieta
				</Button>
			</div>
		</div>
	);
}

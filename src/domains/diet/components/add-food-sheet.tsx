"use client";

import { useState } from "react";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import {
	CustomFoodForm,
	defaultQuantityFor,
	type Food,
	FoodSearch,
	MacroLine,
	macrosFor,
	QuantityEditor,
} from "~/domains/food";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { ChevronLeft, Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface AddFoodSheetProps {
	meal: DietMeal | null;
	onOpenChange: (open: boolean) => void;
	onAdd: (food: Food, quantity: number) => Promise<boolean>;
}

export function AddFoodSheet({ meal, onOpenChange, onAdd }: AddFoodSheetProps) {
	return (
		<Sheet open={meal !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent className="data-[side=bottom]:h-[90svh] sm:data-[side=bottom]:h-[80svh]">
				<SheetHeader className="text-center">
					<SheetTitle>Adicionar alimento</SheetTitle>
					<SheetDescription>{meal?.name}</SheetDescription>
				</SheetHeader>
				{/* Remontado a cada abertura: o passo volta pra busca. */}
				{meal && <AddFoodFlow key={meal.id} onAdd={onAdd} />}
			</BottomSheetContent>
		</Sheet>
	);
}

type Step =
	| { kind: "search" }
	| { kind: "create"; name: string }
	| { kind: "quantity"; food: Food; quantity: number };

function AddFoodFlow({ onAdd }: { onAdd: AddFoodSheetProps["onAdd"] }) {
	const [step, setStep] = useState<Step>({ kind: "search" });
	const [pending, setPending] = useState(false);

	const pick = (food: Food) =>
		setStep({
			kind: "quantity",
			food,
			quantity: defaultQuantityFor(food.unit),
		});

	if (step.kind === "create") {
		return (
			<div className="flex-1 overflow-y-auto p-4">
				<CustomFoodForm
					defaultName={step.name}
					onSaved={pick}
					onCancel={() => setStep({ kind: "search" })}
				/>
			</div>
		);
	}

	if (step.kind === "quantity") {
		const { food, quantity } = step;
		return (
			<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 self-start"
					onClick={() => setStep({ kind: "search" })}
				>
					<ChevronLeft data-icon="inline-start" />
					Outro alimento
				</Button>
				<div className="flex flex-col gap-1">
					<p className="font-heading font-semibold">{food.name}</p>
					<MacroLine macros={macrosFor(food, quantity)} />
				</div>
				<QuantityEditor
					unit={food.unit}
					name={food.name}
					value={quantity}
					onChange={(next) => setStep({ ...step, quantity: next })}
				/>
				<Button
					disabled={pending}
					onClick={async () => {
						setPending(true);
						const ok = await onAdd(food, quantity);
						if (!ok) setPending(false);
					}}
				>
					{pending && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					Adicionar
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col p-4">
			<FoodSearch
				onSelect={pick}
				onCreate={(name) => setStep({ kind: "create", name })}
			/>
		</div>
	);
}

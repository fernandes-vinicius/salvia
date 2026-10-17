"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useState } from "react";
import { toast } from "sonner";

import {
	createFoodAction,
	updateFoodAction,
} from "~/domains/food/actions/food-actions";
import { customFoodSchema } from "~/domains/food/schemas/food-schema";
import type { Food, FoodUnit } from "~/domains/food/types/food-types";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { ChoiceCard } from "~/shared/components/choice-card";
import { Beef, Loader2Icon, Sprout } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/shared/components/ui/radio-group";

const UNIT_OPTIONS: { value: FoodUnit; label: string }[] = [
	{ value: "g", label: "Gramas" },
	{ value: "ml", label: "Mililitros" },
	{ value: "unit", label: "Unidade" },
];

interface CustomFoodFormProps {
	/** Alimento a editar; sem ele, o formulário cadastra um novo. */
	food?: Food;
	/** Trava a unidade (alimento já usado na dieta). */
	unitLocked?: boolean;
	defaultName?: string;
	cancelLabel?: string;
	onSaved: (food: Food) => void;
	onCancel: () => void;
}

// Cadastro/edição de alimento próprio (ex.: whey da sua marca). Macros por
// 100 g/ml ou por unidade, copiados do rótulo.
export function CustomFoodForm({
	food,
	unitLocked = false,
	defaultName = "",
	cancelLabel = "Voltar",
	onSaved,
	onCancel,
}: CustomFoodFormProps) {
	const [unit, setUnit] = useState<FoodUnit>(food?.unit ?? "g");
	const [pending, setPending] = useState(false);

	const [form, fields] = useForm({
		id: `custom-food-${food?.id ?? "new"}`,
		constraint: getZodConstraint(customFoodSchema),
		defaultValue: food
			? {
					name: food.name,
					unit: food.unit,
					protein: String(food.protein),
					carbs: String(food.carbs),
					fat: String(food.fat),
					proteinSource: food.proteinSource,
				}
			: { name: defaultName, unit: "g", proteinSource: "vegetal" },
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: customFoodSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;

			setPending(true);
			const result = food
				? await updateFoodAction(food.id, submission.value)
				: await createFoodAction(submission.value);
			setPending(false);

			if (result.ok) {
				toast.success(food ? "Alimento atualizado." : "Alimento cadastrado.");
				onSaved(result.data);
			} else {
				toast.error(result.error);
			}
		},
	});

	const errorsOf = (errors?: string[]) =>
		errors?.map((message) => ({ message }));
	const base = UNIT_LABELS[unit].base;

	return (
		<form {...getFormProps(form)} className="flex flex-col gap-5">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
					<Input
						{...getInputProps(fields.name, { type: "text" })}
						placeholder="Ex.: Whey protein baunilha"
						autoComplete="off"
					/>
					<FieldError errors={errorsOf(fields.name.errors)} />
				</Field>

				<Field>
					<FieldLabel id="unit-label">Medido em</FieldLabel>
					<RadioGroup
						name={fields.unit.name}
						aria-labelledby="unit-label"
						value={unit}
						onValueChange={(value) => setUnit(value as FoodUnit)}
						disabled={unitLocked}
						className="grid-cols-3 gap-2"
					>
						{UNIT_OPTIONS.map((option) => (
							// biome-ignore lint/a11y/noLabelWithoutControl: o controle é o Radio (Base UI) dentro do label
							<label
								key={option.value}
								className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-card px-3 py-2.5 font-medium text-sm ring-1 ring-transparent transition-colors hover:bg-accent has-data-disabled:cursor-not-allowed has-data-checked:bg-secondary has-data-disabled:opacity-60 has-data-checked:ring-primary/25"
							>
								<RadioGroupItemHidden value={option.value} />
								{option.label}
							</label>
						))}
					</RadioGroup>
					{unitLocked && (
						// RadioGroup desabilitado não envia o valor no form.
						<input type="hidden" name={fields.unit.name} value={unit} />
					)}
					{unitLocked && (
						<p className="text-muted-foreground text-xs">
							Está na sua dieta, então a unidade não muda. Para outra unidade,
							cadastre um novo alimento.
						</p>
					)}
				</Field>

				<div className="grid grid-cols-3 gap-3">
					{(
						[
							["protein", "Proteína"],
							["carbs", "Carboidrato"],
							["fat", "Gordura"],
						] as const
					).map(([key, label]) => (
						<Field key={key}>
							<FieldLabel htmlFor={fields[key].id}>{label}</FieldLabel>
							<Input
								{...getInputProps(fields[key], { type: "number" })}
								step="0.1"
								min="0"
								inputMode="decimal"
								placeholder="0"
							/>
							<FieldError errors={errorsOf(fields[key].errors)} />
						</Field>
					))}
				</div>
				<p className="-mt-3 text-muted-foreground text-xs">
					Gramas de cada macro em {base}, como no rótulo.
				</p>

				<Field>
					<FieldLabel id="protein-source-label">Tipo de proteína</FieldLabel>
					<RadioGroup
						name={fields.proteinSource.name}
						aria-labelledby="protein-source-label"
						defaultValue={food?.proteinSource ?? "vegetal"}
						className="grid-cols-2 gap-2"
					>
						<ChoiceCard
							value="animal"
							icon={Beef}
							title="Animal"
							description="Carne, ovo, leite, whey"
							hideIndicator
						/>
						<ChoiceCard
							value="vegetal"
							icon={Sprout}
							title="Vegetal"
							description="Grãos, pães, frutas"
							hideIndicator
						/>
					</RadioGroup>
				</Field>
			</FieldGroup>

			<div className="flex gap-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					{cancelLabel}
				</Button>
				<Button type="submit" className="flex-1" disabled={pending}>
					{pending && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					{food ? "Salvar" : "Cadastrar"}
				</Button>
			</div>
		</form>
	);
}

// Radio sem bolinha visível: o card inteiro mostra a seleção.
function RadioGroupItemHidden({ value }: { value: string }) {
	return <RadioGroupItem value={value} className="sr-only" />;
}

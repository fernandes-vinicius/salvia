"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { z } from "zod";

import type { DietMeal } from "~/domains/diet/types/diet-types";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

const mealFormSchema = z.object({
	name: z.string().trim().min(1, "Dê um nome à refeição.").max(40),
	time: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido.")
		.optional(),
});

interface MealEditSheetProps {
	meal: DietMeal | null;
	onOpenChange: (open: boolean) => void;
	onSave: (data: { name: string; time: string | null }) => void;
}

export function MealEditSheet({
	meal,
	onOpenChange,
	onSave,
}: MealEditSheetProps) {
	return (
		<Sheet open={meal !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>Editar refeição</SheetTitle>
					<SheetDescription>Nome e horário aparecem na grade.</SheetDescription>
				</SheetHeader>
				{meal && <MealEditForm meal={meal} onSave={onSave} />}
			</BottomSheetContent>
		</Sheet>
	);
}

function MealEditForm({
	meal,
	onSave,
}: {
	meal: DietMeal;
	onSave: MealEditSheetProps["onSave"];
}) {
	const [form, fields] = useForm({
		id: `meal-${meal.id}`,
		constraint: getZodConstraint(mealFormSchema),
		defaultValue: { name: meal.name, time: meal.time ?? "" },
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: mealFormSchema });
		},
		onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;
			onSave({
				name: submission.value.name,
				time: submission.value.time ?? null,
			});
		},
	});

	const errorsOf = (errors?: string[]) =>
		errors?.map((message) => ({ message }));

	return (
		<form {...getFormProps(form)} className="flex flex-col gap-6 p-4">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
					<Input
						{...getInputProps(fields.name, { type: "text" })}
						placeholder="Ex.: Café da manhã"
						autoComplete="off"
					/>
					<FieldError errors={errorsOf(fields.name.errors)} />
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.time.id}>Horário (opcional)</FieldLabel>
					<Input {...getInputProps(fields.time, { type: "time" })} />
					<FieldError errors={errorsOf(fields.time.errors)} />
				</Field>
			</FieldGroup>
			<Button type="submit">Salvar</Button>
		</form>
	);
}

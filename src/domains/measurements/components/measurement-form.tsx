"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useState } from "react";
import { toast } from "sonner";

import { saveMeasurementAction } from "~/domains/measurements/actions/measurement-actions";
import { measurementSchema } from "~/domains/measurements/schemas/measurement-schema";
import type {
	Measurement,
	MeasurementValues,
} from "~/domains/measurements/types/measurement-types";
import {
	MEASUREMENT_FIELDS,
	MEASUREMENT_GROUPS,
	todayIso,
} from "~/domains/measurements/utils/measurements";
import { useCelebrate } from "~/providers/celebration-provider";
import { Loader2Icon, Trash2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import { analytics } from "~/shared/lib/analytics/analytics";

interface MeasurementFormProps {
	/** Medição a editar; sem ela, cria uma nova. */
	measurement?: Measurement;
	/** Valores iniciais de uma nova medição (última conhecida de cada medida). */
	suggested: MeasurementValues;
	onSaved: (measurement: Measurement) => void;
	onDelete?: () => void;
}

export function MeasurementForm({
	measurement,
	suggested,
	onSaved,
	onDelete,
}: MeasurementFormProps) {
	const [pending, setPending] = useState(false);
	const celebrate = useCelebrate();
	const initial = measurement ?? suggested;

	const [form, fields] = useForm({
		id: `measurement-${measurement?.id ?? "new"}`,
		constraint: getZodConstraint(measurementSchema),
		defaultValue: {
			measuredOn: measurement?.measuredOn ?? todayIso(),
			...Object.fromEntries(
				MEASUREMENT_FIELDS.map(({ key }) => [
					key,
					initial[key] === null ? "" : String(initial[key]),
				]),
			),
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: measurementSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;
			setPending(true);
			const result = await saveMeasurementAction(
				measurement?.id ?? null,
				submission.value,
			);
			setPending(false);
			if (result.ok) {
				toast.success(measurement ? "Medição atualizada." : "Medição salva.");
				if (!measurement) {
					analytics.track("medida_salva", {
						com_peso: submission.value.weightKg != null,
					});
				}
				// Pesagem nova é uma meta cumprida (alimenta o ajuste pelo peso).
				if (!measurement && submission.value.weightKg != null) {
					celebrate("goal");
				}
				onSaved(result.data);
			} else {
				toast.error(result.error);
			}
		},
	});

	const errorsOf = (errors?: string[]) =>
		errors?.map((message) => ({ message }));

	return (
		<form {...getFormProps(form)} className="flex flex-col gap-6">
			<Field>
				<FieldLabel htmlFor={fields.measuredOn.id}>Data da medição</FieldLabel>
				<Input
					{...getInputProps(fields.measuredOn, { type: "date" })}
					max={todayIso()}
				/>
				<FieldError errors={errorsOf(fields.measuredOn.errors)} />
			</Field>

			{!measurement && (
				<p className="-mt-3 text-muted-foreground text-xs">
					Já vem com a sua última medição de cada parte: só ajuste o que mudou e
					apague o que não mediu hoje.
				</p>
			)}

			{MEASUREMENT_GROUPS.map((group) => (
				<fieldset key={group} className="flex flex-col gap-3">
					<legend className="mb-3 font-heading font-semibold">{group}</legend>
					<div className="grid gap-4 sm:grid-cols-2">
						{MEASUREMENT_FIELDS.filter((f) => f.group === group).map(
							(field) => {
								const meta = fields[field.key];
								return (
									<Field key={field.key}>
										<FieldLabel htmlFor={meta.id}>
											{field.label} ({field.unit})
										</FieldLabel>
										<Input
											{...getInputProps(meta, { type: "number" })}
											step="0.1"
											min="0"
											inputMode="decimal"
											placeholder="—"
										/>
										<FieldDescription className="text-xs">
											{field.hint}
										</FieldDescription>
										<FieldError errors={errorsOf(meta.errors)} />
									</Field>
								);
							},
						)}
					</div>
				</fieldset>
			))}

			<FieldError errors={errorsOf(form.errors)} />

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
				{onDelete ? (
					<Button type="button" variant="destructive" onClick={onDelete}>
						<Trash2 data-icon="inline-start" />
						Excluir medição
					</Button>
				) : (
					<span />
				)}
				<Button type="submit" disabled={pending}>
					{pending && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					{measurement ? "Salvar alterações" : "Salvar medição"}
				</Button>
			</div>
		</form>
	);
}

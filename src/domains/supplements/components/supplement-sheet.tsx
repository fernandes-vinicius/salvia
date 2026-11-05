"use client";

import {
	getFormProps,
	getInputProps,
	useForm,
	useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { type ReactNode, useState } from "react";

import {
	type SupplementInput,
	supplementFormSchema,
} from "~/domains/supplements/schemas/supplement-schema";
import {
	SUPPLEMENT_DAYS,
	SUPPLEMENT_TIMINGS,
	SUPPLEMENT_UNITS,
	type Supplement,
	type SupplementDays,
	type SupplementMealRef,
	type SupplementTiming,
} from "~/domains/supplements/types/supplement-types";
import {
	DAYS_LABELS,
	looksCaloric,
	TIMING_LABELS,
	UNIT_NAMES,
	WEEK_ORDER,
	WEEKDAY_SHORT,
} from "~/domains/supplements/utils/supplements";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { ChoiceCard } from "~/shared/components/choice-card";
import {
	Clock,
	Dumbbell,
	type LucideIcon,
	Moon,
	Sun,
	Timer,
	Trash2,
	UtensilsCrossed,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/shared/components/ui/radio-group";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { cn } from "~/shared/lib/utils";

/** Atalhos que só preenchem o nome (a dose é sempre da pessoa). */
const COMMON_NAMES = [
	"Creatina",
	"Multivitamínico",
	"Ômega 3",
	"Vitamina D",
	"Magnésio",
	"Cafeína",
];

const TIMING_ICONS: Record<SupplementTiming, LucideIcon> = {
	meal: UtensilsCrossed,
	before_workout: Dumbbell,
	after_workout: Timer,
	wake_up: Sun,
	bedtime: Moon,
	time: Clock,
};

const TIMING_TITLES: Record<SupplementTiming, string> = {
	...TIMING_LABELS,
	meal: "Com uma refeição",
};

interface SupplementSheetProps {
	/** `null` fechado; `"new"` pra adicionar; um suplemento pra editar. */
	editing: Supplement | "new" | null;
	meals: SupplementMealRef[];
	onOpenChange: (open: boolean) => void;
	/** Resolve `true` quando salvou (fecha o painel). */
	onSave: (input: SupplementInput) => Promise<boolean>;
	onDelete: (supplement: Supplement) => void;
}

export function SupplementSheet({
	editing,
	meals,
	onOpenChange,
	onSave,
	onDelete,
}: SupplementSheetProps) {
	const supplement = editing === "new" ? null : editing;
	return (
		<Sheet open={editing !== null} onOpenChange={onOpenChange}>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>
						{supplement ? "Editar suplemento" : "Adicionar suplemento"}
					</SheetTitle>
					<SheetDescription>
						Anote o que você toma ou o que seu nutricionista passou.
					</SheetDescription>
				</SheetHeader>
				{editing !== null && (
					<SupplementForm
						// Formulário novo a cada abertura (valores de quem está editando).
						key={supplement?.id ?? "new"}
						supplement={supplement}
						meals={meals}
						onSave={onSave}
						onDelete={onDelete}
					/>
				)}
			</BottomSheetContent>
		</Sheet>
	);
}

const errorsOf = (errors?: string[]) => errors?.map((message) => ({ message }));

function SupplementForm({
	supplement,
	meals,
	onSave,
	onDelete,
}: {
	supplement: Supplement | null;
	meals: SupplementMealRef[];
	onSave: SupplementSheetProps["onSave"];
	onDelete: SupplementSheetProps["onDelete"];
}) {
	const [saving, setSaving] = useState(false);
	const [timing, setTiming] = useState<SupplementTiming>(
		supplement?.timing ?? "meal",
	);
	const [days, setDays] = useState<SupplementDays>(
		supplement?.days ?? "every_day",
	);
	const [weekdays, setWeekdays] = useState<number[]>(
		supplement?.weekdays ?? [],
	);

	const [form, fields] = useForm({
		id: `supplement-${supplement?.id ?? "new"}`,
		defaultValue: {
			name: supplement?.name ?? "",
			dose: supplement ? String(supplement.dose).replace(".", ",") : "",
			unit: supplement?.unit ?? "g",
			timing: supplement?.timing ?? "meal",
			mealId: supplement?.mealId ?? meals[0]?.id ?? "",
			time: supplement?.time ?? "",
			days: supplement?.days ?? "every_day",
			note: supplement?.note ?? "",
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: supplementFormSchema });
		},
		async onSubmit(event, { submission }) {
			event.preventDefault();
			if (submission?.status !== "success") return;
			setSaving(true);
			const saved = await onSave(submission.value);
			// Fechou (salvou): o formulário desmonta; senão, libera o botão.
			if (!saved) setSaving(false);
		},
	});
	const name = useInputControl(fields.name);
	const caloric = looksCaloric(name.value ?? "");

	function toggleWeekday(day: number) {
		setWeekdays((current) =>
			current.includes(day)
				? current.filter((d) => d !== day)
				: [...current, day],
		);
	}

	return (
		<form
			{...getFormProps(form)}
			className="flex min-h-0 flex-col gap-6 overflow-y-auto p-4"
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
					<Input
						id={fields.name.id}
						value={name.value ?? ""}
						onChange={(event) => name.change(event.target.value)}
						onBlur={name.blur}
						aria-invalid={fields.name.errors ? true : undefined}
						placeholder="Ex.: Creatina"
						autoComplete="off"
						maxLength={60}
					/>
					<div className="flex flex-wrap gap-1.5">
						{COMMON_NAMES.map((common) => (
							<Button
								key={common}
								type="button"
								size="sm"
								variant={name.value === common ? "default" : "secondary"}
								onClick={() => name.change(common)}
							>
								{common}
							</Button>
						))}
					</div>
					<FieldError errors={errorsOf(fields.name.errors)} />
					{caloric && (
						<p className="rounded-2xl bg-muted p-3 text-muted-foreground text-sm">
							<strong className="font-medium text-foreground">
								Esse tem calorias.
							</strong>{" "}
							Whey, albumina, hipercalórico e afins entram como alimento na
							refeição em que você toma (“Adicionar alimento”), pra contar na
							sua meta.
						</p>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor={fields.dose.id}>Dose</FieldLabel>
					<Input
						{...getInputProps(fields.dose, { type: "text" })}
						key={fields.dose.key}
						inputMode="decimal"
						placeholder="Ex.: 5"
						autoComplete="off"
						className="max-w-32 font-heading tabular-nums"
					/>
					<FieldError errors={errorsOf(fields.dose.errors)} />
				</Field>

				<FieldSet>
					<FieldLegend variant="label">Unidade</FieldLegend>
					<RadioGroup
						name={fields.unit.name}
						defaultValue={supplement?.unit ?? "g"}
						aria-label="Unidade"
						className="flex flex-wrap gap-1.5"
					>
						{SUPPLEMENT_UNITS.map((unit) => (
							<OptionChip key={unit} value={unit}>
								{UNIT_NAMES[unit][0]}
							</OptionChip>
						))}
					</RadioGroup>
					<FieldError errors={errorsOf(fields.unit.errors)} />
				</FieldSet>

				<FieldSet>
					<FieldLegend variant="label">Quando</FieldLegend>
					<RadioGroup
						name={fields.timing.name}
						value={timing}
						onValueChange={(value) => setTiming(value as SupplementTiming)}
						aria-label="Quando"
						className="grid grid-cols-1 gap-2 sm:grid-cols-2"
					>
						{SUPPLEMENT_TIMINGS.map((value) => (
							<ChoiceCard
								key={value}
								value={value}
								icon={TIMING_ICONS[value]}
								title={TIMING_TITLES[value]}
								hideIndicator
								className="p-3"
							/>
						))}
					</RadioGroup>

					{timing === "meal" && (
						<>
							<FieldDescription>Qual refeição</FieldDescription>
							<RadioGroup
								name={fields.mealId.name}
								defaultValue={supplement?.mealId ?? meals[0]?.id}
								aria-label="Refeição"
								className="flex flex-wrap gap-1.5"
							>
								{meals.map((meal) => (
									<OptionChip key={meal.id} value={meal.id}>
										{meal.name}
										{meal.time && (
											<span className="ml-1 tabular-nums opacity-80">
												{meal.time}
											</span>
										)}
									</OptionChip>
								))}
							</RadioGroup>
							<FieldError errors={errorsOf(fields.mealId.errors)} />
						</>
					)}
					{timing === "time" && (
						<Field>
							<FieldLabel htmlFor={fields.time.id}>Horário</FieldLabel>
							<Input
								{...getInputProps(fields.time, { type: "time" })}
								key={fields.time.key}
								className="max-w-40"
							/>
							<FieldError errors={errorsOf(fields.time.errors)} />
						</Field>
					)}
				</FieldSet>

				<FieldSet>
					<FieldLegend variant="label">Dias</FieldLegend>
					<RadioGroup
						name={fields.days.name}
						value={days}
						onValueChange={(value) => setDays(value as SupplementDays)}
						aria-label="Dias"
						className="flex flex-wrap gap-1.5"
					>
						{SUPPLEMENT_DAYS.map((value) => (
							<OptionChip key={value} value={value}>
								{DAYS_LABELS[value]}
							</OptionChip>
						))}
					</RadioGroup>
					{days === "training_days" && (
						<FieldDescription>
							Pra lembrar de tomar só quando treina.
						</FieldDescription>
					)}
					{days === "weekdays" && (
						<>
							<div className="flex flex-wrap gap-1.5">
								{WEEK_ORDER.map((day) => (
									<Button
										key={day}
										type="button"
										size="sm"
										aria-pressed={weekdays.includes(day)}
										variant={weekdays.includes(day) ? "default" : "secondary"}
										onClick={() => toggleWeekday(day)}
										className="min-w-12"
									>
										{WEEKDAY_SHORT[day]}
									</Button>
								))}
							</div>
							{weekdays.map((day) => (
								<input
									key={day}
									type="hidden"
									name={fields.weekdays.name}
									value={day}
								/>
							))}
							<FieldError errors={errorsOf(fields.weekdays.errors)} />
						</>
					)}
				</FieldSet>

				<Field>
					<FieldLabel htmlFor={fields.note.id}>
						Observação (opcional)
					</FieldLabel>
					<Input
						{...getInputProps(fields.note, { type: "text" })}
						key={fields.note.key}
						placeholder="Ex.: misturar no shake"
						autoComplete="off"
						maxLength={200}
					/>
					<FieldError errors={errorsOf(fields.note.errors)} />
				</Field>
			</FieldGroup>

			<div className="flex flex-col gap-2">
				<Button type="submit" disabled={saving}>
					{supplement ? "Salvar" : "Adicionar"}
				</Button>
				{supplement && (
					<Button
						type="button"
						variant="ghost"
						className="text-destructive"
						onClick={() => onDelete(supplement)}
					>
						<Trash2 data-icon="inline-start" />
						Remover suplemento
					</Button>
				)}
			</div>
		</form>
	);
}

// Opção curta de RadioGroup em formato de "chip" (unidade, refeição, dias).
function OptionChip({
	value,
	children,
}: {
	value: string;
	children: ReactNode;
}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: o controle é o RadioGroupItem (Base UI) dentro do label
		<label
			className={cn(
				"relative flex min-h-10 cursor-pointer items-center rounded-4xl bg-secondary px-3.5 font-medium text-secondary-foreground text-sm transition-colors hover:bg-accent",
				"has-data-checked:bg-primary has-data-checked:text-primary-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
			)}
		>
			<RadioGroupItem value={value} className="sr-only absolute size-px" />
			{children}
		</label>
	);
}

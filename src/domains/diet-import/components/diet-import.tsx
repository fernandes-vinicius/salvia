"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";

import {
	readDietAction,
	saveImportedDietAction,
} from "~/domains/diet-import/actions/diet-import-actions";
import { PortionSheet } from "~/domains/diet-import/components/portion-sheet";
import type {
	ImportedMeal,
	ImportedPortion,
} from "~/domains/diet-import/types/diet-import-types";
import { compressImage } from "~/domains/diet-import/utils/compress-image";
import {
	ACCEPTED_UPLOAD_TYPES,
	checkUploads,
} from "~/domains/diet-import/utils/diet-import";
import {
	editPortion,
	type PortionPath,
	pendingCount,
	toImportInput,
} from "~/domains/diet-import/utils/review";
import {
	kcalFor,
	MacroLine,
	macrosFor,
	sumMacros,
	UNIT_LABELS,
} from "~/domains/food";
import {
	CircleAlert,
	FileDown,
	Loader2Icon,
	Plus,
	RotateCcw,
	Sparkles,
	XIcon,
} from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button, buttonVariants } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

type Stage =
	| { kind: "upload" }
	| { kind: "reading" }
	| { kind: "review"; meals: ImportedMeal[] };

// Importar dieta do nutri (beta): envia PDF/fotos, a IA lê, a pessoa confere
// tudo e só então a dieta atual é substituída.
export function DietImport() {
	const [stage, setStage] = useState<Stage>({ kind: "upload" });
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);

	async function handleRead() {
		setError(null);
		const prepared = await Promise.all(files.map(compressImage));
		const invalid = checkUploads(prepared);
		if (invalid) {
			setError(invalid);
			return;
		}
		setStage({ kind: "reading" });
		const formData = new FormData();
		for (const file of prepared) formData.append("files", file);
		const result = await readDietAction(formData);
		if (!result.ok) {
			setError(result.error);
			setStage({ kind: "upload" });
			return;
		}
		setStage({ kind: "review", meals: result.data });
	}

	if (stage.kind === "review") {
		return (
			<ImportReview
				meals={stage.meals}
				onChange={(meals) => setStage({ kind: "review", meals })}
				onRestart={() => {
					setFiles([]);
					setStage({ kind: "upload" });
				}}
			/>
		);
	}

	if (stage.kind === "reading") {
		return (
			<output className="flex flex-col items-center gap-3 rounded-3xl bg-card p-8 text-center">
				<Loader2Icon className="size-8 animate-spin text-primary" aria-hidden />
				<p className="font-heading font-semibold">Lendo sua dieta…</p>
				<p className="text-muted-foreground text-sm">
					Pode levar até 1 minuto. Não feche esta tela.
				</p>
			</output>
		);
	}

	return (
		<UploadStep
			files={files}
			error={error}
			onFilesChange={(next) => {
				setFiles(next);
				setError(null);
			}}
			onRead={handleRead}
		/>
	);
}

function UploadStep({
	files,
	error,
	onFilesChange,
	onRead,
}: {
	files: File[];
	error: string | null;
	onFilesChange: (files: File[]) => void;
	onRead: () => void;
}) {
	const inputId = useId();
	return (
		<div className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5">
			<div className="flex items-start gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
					<Sparkles className="size-5" aria-hidden />
				</span>
				<div className="flex flex-col gap-1">
					<p className="flex items-center gap-2 font-heading font-semibold">
						Dieta do nutri pro app
						<Badge variant="secondary">Beta</Badge>
					</p>
					<p className="text-muted-foreground text-sm">
						Envie o PDF ou fotos da sua dieta. A IA lê as refeições, os
						alimentos e as substituições, e você confere tudo antes de salvar.
					</p>
				</div>
			</div>

			<input
				id={inputId}
				type="file"
				multiple
				accept={ACCEPTED_UPLOAD_TYPES.join(",")}
				className="sr-only"
				onChange={(event) => {
					const picked = Array.from(event.target.files ?? []);
					onFilesChange([...files, ...picked]);
					event.target.value = "";
				}}
			/>
			<label
				htmlFor={inputId}
				className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
			>
				<Plus data-icon="inline-start" />
				{files.length > 0 ? "Adicionar mais" : "Escolher PDF ou fotos"}
			</label>

			{files.length > 0 && (
				<ul className="flex flex-col gap-1">
					{files.map((file, index) => (
						<li
							key={`${file.name}-${index}`}
							className="flex items-center gap-2 rounded-2xl bg-background py-1 pr-1 pl-3 text-sm"
						>
							<FileDown className="size-4 shrink-0 text-muted-foreground" />
							<span className="min-w-0 flex-1 truncate">{file.name}</span>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Tirar ${file.name}`}
								onClick={() =>
									onFilesChange(files.filter((_, i) => i !== index))
								}
							>
								<XIcon />
							</Button>
						</li>
					))}
				</ul>
			)}

			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}

			<Button disabled={files.length === 0} onClick={onRead}>
				<Sparkles data-icon="inline-start" />
				Ler dieta
			</Button>
			<p className="text-muted-foreground text-xs">
				Até 4 arquivos. A leitura usa o Google Gemini e o arquivo não fica
				guardado no app.
			</p>
		</div>
	);
}

function ImportReview({
	meals,
	onChange,
	onRestart,
}: {
	meals: ImportedMeal[];
	onChange: (meals: ImportedMeal[]) => void;
	onRestart: () => void;
}) {
	const router = useRouter();
	const [editing, setEditing] = useState<PortionPath | null>(null);
	const [saving, setSaving] = useState(false);

	const pending = pendingCount(meals);
	const totals = sumMacros(
		meals.flatMap((meal) =>
			meal.items.flatMap((item) =>
				item.food ? [macrosFor(item.food, item.quantity)] : [],
			),
		),
	);
	const editingPortion = editing ? findPortion(meals, editing) : null;

	async function handleSave() {
		setSaving(true);
		const result = await saveImportedDietAction(toImportInput(meals));
		if (!result.ok) {
			setSaving(false);
			toast.error(result.error);
			return;
		}
		toast.success("Dieta importada! Confira os totais com a sua meta.");
		router.push("/dieta");
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2 rounded-3xl bg-card p-4 md:p-5">
				<p className="font-heading font-semibold">Confira antes de salvar</p>
				<p className="text-muted-foreground text-sm">
					Toque num alimento pra trocar, ajustar a quantidade ou tirar. Os
					totais contam só o que foi encontrado.
				</p>
				<p className="font-heading font-semibold text-2xl tabular-nums">
					{formatNumber(kcalFor(totals))} kcal
				</p>
				<MacroLine macros={totals} />
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{meals.map((meal) => (
					<section
						key={meal.key}
						aria-label={meal.name}
						className="flex min-w-0 flex-col gap-2 rounded-3xl bg-card p-4"
					>
						<h2 className="flex items-baseline justify-between gap-2 font-heading font-semibold">
							{meal.name}
							{meal.time && (
								<span className="font-normal text-muted-foreground text-sm tabular-nums">
									{meal.time}
								</span>
							)}
						</h2>
						{meal.items.length === 0 && (
							<p className="text-muted-foreground text-sm">
								Sem alimentos: a refeição não vai ser salva.
							</p>
						)}
						<ul className="flex flex-col gap-1">
							{meal.items.map((item) => (
								<li key={item.key} className="flex flex-col">
									<PortionRow
										portion={item}
										onClick={() =>
											setEditing({ meal: meal.key, item: item.key })
										}
									/>
									{item.options.map((option) => (
										<PortionRow
											key={option.key}
											portion={option}
											isOption
											onClick={() =>
												setEditing({
													meal: meal.key,
													item: item.key,
													option: option.key,
												})
											}
										/>
									))}
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			<div className="flex flex-col gap-3 rounded-3xl bg-secondary p-4">
				{pending > 0 ? (
					<p className="flex items-start gap-2 text-sm">
						<CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
						{pending === 1
							? "1 alimento não foi encontrado: escolha o certo ou tire da dieta."
							: `${pending} alimentos não foram encontrados: escolha os certos ou tire da dieta.`}
					</p>
				) : (
					<p className="text-sm">
						Salvar <strong>substitui a sua dieta atual</strong> por esta.
					</p>
				)}
				<Button disabled={pending > 0 || saving} onClick={handleSave}>
					{saving && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					Salvar dieta
				</Button>
				<Button variant="ghost" disabled={saving} onClick={onRestart}>
					<RotateCcw data-icon="inline-start" />
					Ler outro arquivo
				</Button>
			</div>

			<PortionSheet
				portion={editingPortion}
				onOpenChange={(open) => {
					if (!open) setEditing(null);
				}}
				onChange={(next) => {
					if (editing) onChange(editPortion(meals, editing, () => next));
				}}
				onRemove={() => {
					if (editing) onChange(editPortion(meals, editing, () => null));
					setEditing(null);
				}}
			/>
		</div>
	);
}

function findPortion(meals: ImportedMeal[], path: PortionPath) {
	const item = meals
		.find((meal) => meal.key === path.meal)
		?.items.find((entry) => entry.key === path.item);
	if (!item) return null;
	if (path.option === undefined) return item;
	return item.options.find((option) => option.key === path.option) ?? null;
}

function PortionRow({
	portion,
	isOption = false,
	onClick,
}: {
	portion: ImportedPortion;
	isOption?: boolean;
	onClick: () => void;
}) {
	const { food } = portion;
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-start justify-between gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-muted",
				isOption && "pl-6",
				!food && "bg-destructive/10 hover:bg-destructive/15",
			)}
		>
			<span className="flex min-w-0 flex-col">
				<span
					className={cn(
						"text-sm",
						isOption && "text-muted-foreground",
						!food && "flex items-center gap-1 font-medium text-destructive",
					)}
				>
					{isOption && "ou "}
					{food ? (
						food.name
					) : (
						<>
							<CircleAlert className="size-4 shrink-0" aria-hidden />
							Não encontrado: escolher
						</>
					)}
				</span>
				<span className="truncate text-muted-foreground text-xs">
					Lido: {portion.text}
				</span>
			</span>
			{food && (
				<span className="shrink-0 text-sm tabular-nums">
					{formatNumber(portion.quantity, 1)} {UNIT_LABELS[food.unit].short}
				</span>
			)}
		</button>
	);
}

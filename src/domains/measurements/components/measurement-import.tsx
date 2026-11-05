"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { importMeasurementsAction } from "~/domains/measurements/actions/measurement-actions";
import {
	buildImport,
	type Cell,
	type ColumnMapping,
	type ColumnTarget,
	findHeader,
	MAX_IMPORT_ROWS,
	parseCsv,
	templateCsv,
} from "~/domains/measurements/utils/measurement-import";
import {
	formatDate,
	MEASUREMENT_FIELDS,
} from "~/domains/measurements/utils/measurements";
import {
	CircleAlert,
	Download,
	FileSpreadsheet,
	Loader2Icon,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface Sheet {
	name: string;
	rows: Cell[][];
	headerIndex: number;
	columns: string[];
}

async function readRows(file: File): Promise<Cell[][]> {
	const name = file.name.toLowerCase();
	if (name.endsWith(".xlsx")) {
		// Só baixa o leitor de Excel quando alguém escolhe um .xlsx.
		const { readSheet } = await import("read-excel-file/browser");
		return (await readSheet(file)) as Cell[][];
	}
	if (name.endsWith(".csv") || name.endsWith(".txt")) {
		return parseCsv(await file.text());
	}
	throw new Error(
		"Use um arquivo .xlsx ou .csv. Planilha .xls antiga? Abra no Excel e salve como .xlsx.",
	);
}

function plural(count: number, one: string, many: string) {
	return `${count} ${count === 1 ? one : many}`;
}

/**
 * Importar planilha de medidas: lê o arquivo no navegador (nada é enviado
 * além das medições), reconhece as colunas, mostra a prévia e grava.
 */
export function MeasurementImport({
	existingDays,
	today,
}: {
	existingDays: string[];
	today: string;
}) {
	const router = useRouter();
	const inputId = useId();
	const [sheet, setSheet] = useState<Sheet | null>(null);
	const [mapping, setMapping] = useState<ColumnMapping>([]);
	const [error, setError] = useState<string | null>(null);
	const [reading, setReading] = useState(false);
	const [saving, setSaving] = useState(false);
	const existing = useMemo(() => new Set(existingDays), [existingDays]);

	const plan = useMemo(
		() =>
			sheet
				? buildImport({
						rows: sheet.rows,
						header: { index: sheet.headerIndex, mapping },
						existingDays: existing,
						today,
					})
				: null,
		[sheet, mapping, existing, today],
	);

	async function handleFile(file: File | undefined) {
		if (!file) return;
		setError(null);
		setSheet(null);
		if (file.size > MAX_FILE_BYTES) {
			setError("Arquivo grande demais (máximo 5 MB).");
			return;
		}
		setReading(true);
		try {
			const rows = await readRows(file);
			const header = findHeader(rows);
			if (!header) {
				setError(
					"Não achamos a coluna com a data e pelo menos uma medida. Confira se a primeira linha tem os nomes das colunas (Data, Peso, Cintura…) ou use o modelo.",
				);
				return;
			}
			setSheet({
				name: file.name,
				rows,
				headerIndex: header.index,
				columns: rows[header.index].map((cell) => String(cell ?? "").trim()),
			});
			setMapping(header.mapping);
		} catch (cause) {
			setError(
				cause instanceof Error && cause.message.includes(".xlsx")
					? cause.message
					: "Não deu pra ler esse arquivo. Tente salvar como .csv ou .xlsx.",
			);
		} finally {
			setReading(false);
		}
	}

	function changeColumn(column: number, target: ColumnTarget | null) {
		setMapping((current) =>
			current.map((value, index) => (index === column ? target : value)),
		);
	}

	async function handleImport() {
		if (!plan || plan.entries.length === 0) return;
		setSaving(true);
		const result = await importMeasurementsAction(plan.entries);
		setSaving(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		analytics.track("medidas_importadas", { quantidade: result.data.imported });
		toast.success(
			`${plural(result.data.imported, "medição importada", "medições importadas")}.`,
		);
		router.push("/medidas");
		router.refresh();
	}

	function downloadTemplate() {
		const url = URL.createObjectURL(
			new Blob([templateCsv()], { type: "text/csv;charset=utf-8" }),
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = "modelo-medidas-salvia.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	const tooMany = plan !== null && plan.entries.length > MAX_IMPORT_ROWS;
	const mappedColumns = mapping
		.map((target, column) => ({ target, column }))
		.filter(({ target }) => target !== null && target !== "date");

	return (
		<div className="flex flex-col gap-6">
			<section className="flex flex-col gap-4 rounded-3xl bg-card p-5">
				<div className="flex flex-col gap-1.5">
					<h2 className="font-heading font-semibold text-lg">Sua planilha</h2>
					<p className="text-pretty text-muted-foreground text-sm">
						Uma linha por dia, com a data e as medidas que você tiver (peso,
						cintura, braço…). Os nomes das colunas ficam na primeira linha. Vale
						.xlsx do Excel ou .csv (no Google Planilhas: Arquivo → Fazer
						download → CSV).
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<label
						htmlFor={inputId}
						className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-4xl bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
					>
						{reading ? (
							<Loader2Icon className="size-4 animate-spin" aria-hidden />
						) : (
							<FileSpreadsheet className="size-4" aria-hidden />
						)}
						Escolher planilha
						<input
							id={inputId}
							type="file"
							accept=".csv,.xlsx,.xls,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
							className="sr-only"
							onChange={(event) => {
								void handleFile(event.target.files?.[0]);
								event.target.value = "";
							}}
						/>
					</label>
					<Button variant="outline" onClick={downloadTemplate}>
						<Download data-icon="inline-start" />
						Baixar modelo
					</Button>
				</div>
				{error && (
					<p role="alert" className="flex gap-2 text-destructive text-sm">
						<CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
						{error}
					</p>
				)}
			</section>

			{sheet && plan && (
				<>
					<section className="flex flex-col gap-4 rounded-3xl bg-card p-5">
						<div className="flex flex-col gap-1.5">
							<h2 className="font-heading font-semibold text-lg">Colunas</h2>
							<p className="text-pretty text-muted-foreground text-sm">
								Confira o que é cada coluna de “{sheet.name}”. As que ficarem em
								“Ignorar” não entram.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{sheet.columns.map((name, column) => {
								const label = name || `Coluna ${column + 1}`;
								return (
									<label
										// biome-ignore lint/suspicious/noArrayIndexKey: colunas fixas da planilha lida
										key={column}
										className="flex min-w-0 flex-col gap-1.5 text-sm"
									>
										<span className="truncate font-medium">{label}</span>
										<select
											aria-label={`Coluna “${label}”`}
											value={mapping[column] ?? ""}
											onChange={(event) =>
												changeColumn(
													column,
													(event.target.value || null) as ColumnTarget | null,
												)
											}
											className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
										>
											<option value="">Ignorar</option>
											<option value="date">Data</option>
											{MEASUREMENT_FIELDS.map((field) => (
												<option key={field.key} value={field.key}>
													{field.label} ({field.unit})
												</option>
											))}
										</select>
									</label>
								);
							})}
						</div>
					</section>

					<section className="flex flex-col gap-4 rounded-3xl bg-secondary p-5">
						{plan.entries.length > 0 && plan.first && plan.last ? (
							<p className="font-heading font-semibold text-lg">
								{plural(plan.entries.length, "medição", "medições")} de{" "}
								{formatDate(plan.first)} a {formatDate(plan.last)}
							</p>
						) : (
							<p className="font-heading font-semibold text-lg">
								Nada novo pra importar
							</p>
						)}
						<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
							{plan.existing > 0 && (
								<li>
									{plural(plan.existing, "dia já está", "dias já estão")} no app
									e {plan.existing === 1 ? "fica" : "ficam"} como{" "}
									{plan.existing === 1 ? "está" : "estão"}.
								</li>
							)}
							{plan.repeated > 0 && (
								<li>
									{plural(plan.repeated, "dia aparece", "dias aparecem")} mais
									de uma vez: vale a primeira linha.
								</li>
							)}
							{plan.skipped > 0 && (
								<li>
									{plural(plan.skipped, "linha ficou", "linhas ficaram")} de
									fora (sem data válida ou sem medida).
								</li>
							)}
							{plan.outOfRange > 0 && (
								<li>
									{plural(
										plan.outOfRange,
										"valor fora do normal ficou",
										"valores fora do normal ficaram",
									)}{" "}
									em branco (ex.: peso em libras, medida em mm).
								</li>
							)}
							{tooMany && (
								<li className="text-destructive">
									Dá pra importar até {MAX_IMPORT_ROWS} medições por vez. Divida
									a planilha.
								</li>
							)}
						</ul>

						{plan.entries.length > 0 && mappedColumns.length > 0 && (
							<div className="overflow-x-auto rounded-2xl bg-card">
								<table className="w-full text-sm tabular-nums">
									<caption className="sr-only">
										Primeiras medições da planilha
									</caption>
									<thead>
										<tr className="text-left text-muted-foreground">
											<th className="px-3 py-2 font-medium">Data</th>
											{mappedColumns.map(({ target, column }) => (
												<th
													key={column}
													className="whitespace-nowrap px-3 py-2 font-medium"
												>
													{
														MEASUREMENT_FIELDS.find(
															(field) => field.key === target,
														)?.short
													}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{plan.entries.slice(0, 5).map((entry) => (
											<tr
												key={entry.measuredOn}
												className="border-foreground/5 border-t"
											>
												<td className="whitespace-nowrap px-3 py-2">
													{formatDate(entry.measuredOn)}
												</td>
												{mappedColumns.map(({ target, column }) => {
													const value =
														target && target !== "date" ? entry[target] : null;
													return (
														<td key={column} className="px-3 py-2">
															{value?.toLocaleString("pt-BR") ?? ""}
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{plan.entries.length > 0 && !tooMany && (
							<Button
								size="lg"
								className="w-full sm:w-auto sm:self-start"
								onClick={handleImport}
								disabled={saving}
							>
								{saving && (
									<Loader2Icon
										data-icon="inline-start"
										className="animate-spin"
									/>
								)}
								Importar {plural(plan.entries.length, "medição", "medições")}
							</Button>
						)}
					</section>
				</>
			)}
		</div>
	);
}

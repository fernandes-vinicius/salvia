"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteMeasurementAction } from "~/domains/measurements/actions/measurement-actions";
import { EvolutionChart } from "~/domains/measurements/components/evolution-chart";
import { MeasurementForm } from "~/domains/measurements/components/measurement-form";
import { MeasurementHistory } from "~/domains/measurements/components/measurement-history";
import { MeasurementStats } from "~/domains/measurements/components/measurement-stats";
import type {
	Measurement,
	MeasurementKey,
} from "~/domains/measurements/types/measurement-types";
import {
	formatDate,
	latestValues,
} from "~/domains/measurements/utils/measurements";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { Plus, Ruler } from "~/shared/components/icons";
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
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/shared/components/ui/empty";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

type Editing = { kind: "new" } | { kind: "edit"; measurement: Measurement };

/** Mais recente primeiro. */
function sortDesc(list: Measurement[]) {
	return [...list].sort((a, b) => b.measuredOn.localeCompare(a.measuredOn));
}

export function MeasurementsView({
	initialMeasurements,
}: {
	initialMeasurements: Measurement[];
}) {
	const [measurements, setMeasurements] = useState(() =>
		sortDesc(initialMeasurements),
	);
	const [selected, setSelected] = useState<MeasurementKey>("weightKg");
	const [editing, setEditing] = useState<Editing | null>(null);
	const [deleting, setDeleting] = useState<Measurement | null>(null);

	function handleSaved(saved: Measurement) {
		setMeasurements((current) =>
			sortDesc([...current.filter((m) => m.id !== saved.id), saved]),
		);
		setEditing(null);
	}

	async function handleDelete(measurement: Measurement) {
		setDeleting(null);
		setEditing(null);
		const previous = measurements;
		setMeasurements((current) =>
			current.filter((m) => m.id !== measurement.id),
		);
		const result = await deleteMeasurementAction(measurement.id);
		if (result.ok) toast.success("Medição excluída.");
		else {
			setMeasurements(previous);
			toast.error(result.error);
		}
	}

	const newButton = (
		<Button onClick={() => setEditing({ kind: "new" })}>
			<Plus data-icon="inline-start" />
			Nova medição
		</Button>
	);
	const editingMeasurement =
		editing?.kind === "edit" ? editing.measurement : undefined;

	return (
		<div className="flex flex-col gap-6">
			{measurements.length === 0 ? (
				<Empty className="rounded-3xl bg-card">
					<EmptyHeader>
						<EmptyMedia
							variant="icon"
							className="rounded-full bg-secondary text-primary"
						>
							<Ruler />
						</EmptyMedia>
						<EmptyTitle>Nenhuma medição ainda</EmptyTitle>
						<EmptyDescription>
							Registre peso e medidas de tempos em tempos (a cada 2 a 4 semanas,
							por exemplo) pra acompanhar sua evolução.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>{newButton}</EmptyContent>
				</Empty>
			) : (
				<>
					<div className="flex items-center justify-between gap-3">
						<p className="text-muted-foreground text-sm">
							Última medição em {formatDate(measurements[0].measuredOn)}
						</p>
						{newButton}
					</div>
					<MeasurementStats
						measurements={measurements}
						selected={selected}
						onSelect={setSelected}
					/>
					<EvolutionChart
						measurements={measurements}
						selected={selected}
						onSelect={setSelected}
					/>
					<MeasurementHistory
						measurements={measurements}
						onEdit={(measurement) => setEditing({ kind: "edit", measurement })}
					/>
				</>
			)}

			<Sheet
				open={editing !== null}
				onOpenChange={(open) => !open && setEditing(null)}
			>
				<BottomSheetContent>
					<SheetHeader className="text-center">
						<SheetTitle>
							{editingMeasurement
								? `Medição de ${formatDate(editingMeasurement.measuredOn)}`
								: "Nova medição"}
						</SheetTitle>
						<SheetDescription>
							Peso em kg e medidas em cm. Preencha só o que mediu.
						</SheetDescription>
					</SheetHeader>
					{editing && (
						<div className="flex-1 overflow-y-auto p-4">
							<MeasurementForm
								key={editingMeasurement?.id ?? "new"}
								measurement={editingMeasurement}
								suggested={latestValues(measurements)}
								onSaved={handleSaved}
								onDelete={
									editingMeasurement
										? () => setDeleting(editingMeasurement)
										: undefined
								}
							/>
						</div>
					)}
				</BottomSheetContent>
			</Sheet>

			<AlertDialog
				open={deleting !== null}
				onOpenChange={(open) => !open && setDeleting(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Excluir a medição de {deleting && formatDate(deleting.measuredOn)}
							?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Ela sai do histórico e do gráfico.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={() => deleting && handleDelete(deleting)}
						>
							Excluir
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

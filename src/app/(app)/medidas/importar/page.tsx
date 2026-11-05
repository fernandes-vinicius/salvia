import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { MeasurementImport } from "~/domains/measurements/components/measurement-import";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { ChevronLeft } from "~/shared/components/icons";
import { PageHeader } from "~/shared/components/page-header";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { localDateString } from "~/shared/lib/dates";

export const metadata: Metadata = { title: "Importar medidas" };

export default function ImportMeasurementsPage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 self-start"
					nativeButton={false}
					render={<Link href="/medidas" />}
				>
					<ChevronLeft data-icon="inline-start" />
					Medidas
				</Button>
				<PageHeader
					title="Importar medidas"
					description="Traga o histórico da sua planilha pro app, sem digitar dia por dia."
				/>
			</div>
			<Suspense fallback={<Skeleton className="h-56 rounded-3xl" />}>
				<ImportContent />
			</Suspense>
		</main>
	);
}

async function ImportContent() {
	const user = await getCurrentUser();
	const measurements = await listMeasurements(user.id);
	return (
		<MeasurementImport
			existingDays={measurements.map((measurement) => measurement.measuredOn)}
			today={localDateString()}
		/>
	);
}

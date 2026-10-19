import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { MeasurementsView } from "~/domains/measurements";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { CelebrationProvider } from "~/providers/celebration-provider";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Minhas medidas" };

export default function MedidasPage() {
	return (
		<main data-wide-page className="container-wide flex flex-col gap-8">
			<PageHeader
				title="Minhas medidas"
				description="Peso e medidas corporais ao longo do tempo, pra acompanhar sua evolução."
			/>
			<Suspense fallback={<MeasurementsSkeleton />}>
				<MeasurementsContent />
			</Suspense>
		</main>
	);
}

async function MeasurementsContent() {
	const user = await getCurrentUser();
	const [measurements, settings] = await Promise.all([
		listMeasurements(user.id),
		getSettingsByUserId(user.id),
	]);
	return (
		<CelebrationProvider enabled={settings.celebrations}>
			<MeasurementsView initialMeasurements={measurements} />
		</CelebrationProvider>
	);
}

function MeasurementsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
			</div>
			<Skeleton className="h-72 rounded-3xl" />
			<Skeleton className="h-64 rounded-3xl" />
		</div>
	);
}

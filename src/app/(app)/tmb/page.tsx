import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { EXAMPLE_PROFILE, TmbForm } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "TMB" };

export default function TmbPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="TMB"
				description="Seus dados para calcular quantas calorias você gasta por dia."
			/>
			<Suspense fallback={<TmbFormSkeleton />}>
				<TmbContent />
			</Suspense>
		</main>
	);
}

async function TmbContent() {
	const user = await getCurrentUser();
	const [profile, settings] = await Promise.all([
		findProfileByUserId(user.id),
		getSettingsByUserId(user.id),
	]);

	return (
		<TmbForm
			initialProfile={profile ?? EXAMPLE_PROFILE}
			isExample={!profile}
			bmrFormula={settings.bmrFormula}
		/>
	);
}

function TmbFormSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
			<Skeleton className="h-44 rounded-3xl md:order-2" />
			<div className="flex flex-col gap-3 md:order-1">
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-44 rounded-2xl" />
				<Skeleton className="h-44 rounded-2xl" />
			</div>
		</div>
	);
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { MyFoods } from "~/domains/food";
import { listCustomFoods } from "~/domains/food/services/food-service";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { SettingsForm } from "~/domains/settings";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Configurações"
				description="Como o app faz os cálculos e os alimentos que você cadastrou."
			/>
			<Suspense fallback={<SettingsSkeleton />}>
				<SettingsContent />
			</Suspense>
		</main>
	);
}

async function SettingsContent() {
	const user = await getCurrentUser();
	const [settings, profile, foods] = await Promise.all([
		getSettingsByUserId(user.id),
		findProfileByUserId(user.id),
		listCustomFoods(user.id),
	]);

	return (
		<div className="flex flex-col gap-10">
			<SettingsForm initialSettings={settings} profile={profile} />
			<MyFoods initialFoods={foods} />
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<Skeleton className="h-6 w-64" />
			<Skeleton className="h-24 rounded-2xl" />
			<Skeleton className="h-24 rounded-2xl" />
		</div>
	);
}

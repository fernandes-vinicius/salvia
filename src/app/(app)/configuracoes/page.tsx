import type { Metadata } from "next";
import { Suspense } from "react";

import { DeleteAccount } from "~/domains/auth";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { SettingsForm } from "~/domains/settings";
import { DataExport } from "~/domains/settings/components/data-export";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Configurações"
				description="Como o app faz os cálculos e a sua conta."
			/>
			<Suspense fallback={<SettingsSkeleton />}>
				<SettingsContent />
			</Suspense>
		</main>
	);
}

async function SettingsContent() {
	const user = await getCurrentUser();
	const [settings, profile] = await Promise.all([
		getSettingsByUserId(user.id),
		findProfileByUserId(user.id),
	]);

	return (
		<div className="flex flex-col gap-10">
			<SettingsForm initialSettings={settings} profile={profile} />
			<DataExport />
			<DeleteAccount />
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

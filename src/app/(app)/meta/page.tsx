import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { EXAMPLE_GOAL, GoalForm } from "~/domains/goal";
import { CalibrationCard } from "~/domains/goal/components/calibration-card";
import { getCalibrationState } from "~/domains/goal/services/calibration-service";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { Flame } from "~/shared/components/icons";
import { PageHeader } from "~/shared/components/page-header";
import { Button } from "~/shared/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/shared/components/ui/empty";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Meta" };

export default function MetaPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Meta"
				description="Seu objetivo e quanto comer de cada macronutriente por dia."
			/>
			<Suspense fallback={<GoalFormSkeleton />}>
				<MetaContent />
			</Suspense>
		</main>
	);
}

async function MetaContent() {
	const user = await getCurrentUser();
	const [profile, settings, calibrationState] = await Promise.all([
		findProfileByUserId(user.id),
		getSettingsByUserId(user.id),
		getCalibrationState(user.id),
	]);
	const goal = calibrationState?.goal ?? null;

	// A meta depende do gasto calórico e do peso, que vêm da aba TMB.
	if (!profile) {
		return (
			<Empty className="rounded-2xl bg-card">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full bg-secondary text-primary"
					>
						<Flame />
					</EmptyMedia>
					<EmptyTitle>Primeiro, seus dados</EmptyTitle>
					<EmptyDescription>
						Para montar sua meta, precisamos saber quanto você gasta por dia.
						Preencha a aba TMB: leva menos de um minuto.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						nativeButton={false}
						render={<Link href="/tmb">Preencher TMB</Link>}
					/>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{calibrationState && (
				<CalibrationCard
					analysis={calibrationState.analysis}
					calibration={calibrationState.calibration}
				/>
			)}
			<GoalForm
				profile={profile}
				initialGoal={goal ?? EXAMPLE_GOAL}
				isExample={!goal}
				bmrFormula={settings.bmrFormula}
				calibrationKcal={calibrationState?.calibration.kcal ?? 0}
			/>
		</div>
	);
}

function GoalFormSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
			<Skeleton className="h-64 rounded-3xl md:order-2" />
			<div className="flex flex-col gap-3 md:order-1">
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
			</div>
		</div>
	);
}

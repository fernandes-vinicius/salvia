import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { suggestedWater } from "~/domains/calculators/utils/water";
import { listCheckins } from "~/domains/checkin/services/checkin-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import { calculateTargets } from "~/domains/goal";
import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import { DayReportActions } from "~/domains/home/components/day-report-actions";
import { DayReportView } from "~/domains/home/components/day-report-view";
import { buildDayReport, dayReportText } from "~/domains/home/utils/day-report";
import { diaryDay, diaryLongDate } from "~/domains/home/utils/diary";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import {
	listSupplementCheckins,
	listSupplements,
} from "~/domains/supplements/services/supplement-service";
import { supplementsForDay } from "~/domains/supplements/utils/supplements";
import { listWaterLogs } from "~/domains/water/services/water-service";
import { ChevronLeft } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { SITE_URL } from "~/shared/lib/app-config";
import { localDateString } from "~/shared/lib/dates";

export const metadata: Metadata = { title: "Relatório do dia" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DayReportPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<main className="container-wrapper flex flex-col gap-6 print:max-w-none print:p-0">
			<Suspense fallback={<ReportSkeleton />}>
				<ReportContent searchParams={searchParams} />
			</Suspense>
		</main>
	);
}

async function ReportContent({ searchParams }: { searchParams: SearchParams }) {
	const user = await getCurrentUser();
	const today = localDateString();
	const raw = (await searchParams).dia;
	const day = diaryDay(Array.isArray(raw) ? raw[0] : raw, today);

	const [
		profile,
		goal,
		settings,
		calibration,
		meals,
		checkins,
		waterLogs,
		supplements,
		taken,
		measurements,
	] = await Promise.all([
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
		findGoalCalibration(user.id),
		getDiet(user.id, { createIfEmpty: false }),
		listCheckins(user.id, day),
		listWaterLogs(user.id, day),
		listSupplements(user.id),
		listSupplementCheckins(user.id, day),
		listMeasurements(user.id),
	]);

	const report = buildDayReport({
		day,
		meals,
		checkins,
		water: waterLogs.find((log) => log.day === day),
		waterTargetMl: profile ? suggestedWater(profile).recommendedMl : null,
		supplements: supplementsForDay(supplements, day),
		taken,
		weightKg:
			measurements.find((measurement) => measurement.measuredOn === day)
				?.weightKg ?? null,
		proteinCounting: settings.proteinCounting,
	});

	const targets =
		profile && goal
			? calculateTargets(goal, {
					tdee: calculateTdee(profile, settings.bmrFormula) + calibration.kcal,
					bmr: calculateBmr(profile, settings.bmrFormula),
					weightKg: profile.weightKg,
				})
			: null;

	return (
		<>
			<div className="flex flex-col gap-3">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 self-start print:hidden"
					nativeButton={false}
					render={
						<Link
							href={day === today ? "/dashboard" : `/dashboard?dia=${day}`}
						/>
					}
				>
					<ChevronLeft data-icon="inline-start" />
					Início
				</Button>
				<div className="flex flex-col gap-1">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Relatório do dia
					</p>
					<h1 className="font-heading font-semibold text-2xl first-letter:uppercase sm:text-3xl">
						{diaryLongDate(day)}
					</h1>
				</div>
				<DayReportActions
					day={day}
					text={dayReportText(report, SITE_URL.origin)}
				/>
			</div>
			<DayReportView
				report={report}
				proteinCounting={settings.proteinCounting}
				targets={
					targets && {
						protein: targets.protein.grams,
						carbs: targets.carbs.grams,
						fat: targets.fat.grams,
						kcal: targets.calories,
					}
				}
				supplementMeals={meals}
			/>
		</>
	);
}

function ReportSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-9 w-64" />
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
				<Skeleton className="h-24 rounded-3xl" />
			</div>
			<Skeleton className="h-64 rounded-3xl" />
		</div>
	);
}

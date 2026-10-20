import type { Metadata } from "next";
import { Suspense } from "react";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { suggestedWater } from "~/domains/calculators/utils/water";
import { addDays, CheckinCard, type CheckinMeal } from "~/domains/checkin";
import { listCheckins } from "~/domains/checkin/services/checkin-service";
import { periodAdherence } from "~/domains/checkin/utils/checkin";
import { summarizeDiet } from "~/domains/diet";
import { getDiet } from "~/domains/diet/services/diet-service";
import { ironTarget } from "~/domains/diet/utils/micronutrients";
import { DietTemplates, previewTemplates } from "~/domains/diet-templates";
import { getTemplateFoods } from "~/domains/diet-templates/services/diet-template-service";
import { listCustomFoods } from "~/domains/food/services/food-service";
import { calculateTargets } from "~/domains/goal";
import { CalibrationCard } from "~/domains/goal/components/calibration-card";
import { DietReviewCard } from "~/domains/goal/components/diet-review-card";
import { GOAL_WARNING_MESSAGES } from "~/domains/goal/components/goal-warnings";
import {
	findDietCycle,
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import {
	analyzeCalibration,
	calibrationWindowStart,
	toWeighIns,
} from "~/domains/goal/utils/calibration";
import { reviewStatus, weightSince } from "~/domains/goal/utils/review";
import { AttentionList } from "~/domains/home/components/attention-list";
import { GoalCard } from "~/domains/home/components/goal-card";
import { MeasurementsCard } from "~/domains/home/components/measurements-card";
import { NextMealCard } from "~/domains/home/components/next-meal-card";
import { PlanOverview } from "~/domains/home/components/plan-overview";
import {
	SetupChecklist,
	type SetupStep,
} from "~/domains/home/components/setup-checklist";
import { WaterCard } from "~/domains/home/components/water-card";
import {
	type AttentionItem,
	emptyMealItems,
	micronutrientItems,
	suspiciousFoods,
} from "~/domains/home/utils/home";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { NewsCard } from "~/domains/news/components/news-card";
import { getLatestNews } from "~/domains/news/services/news-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { WeeklySummaryCard } from "~/domains/weekly-summary/components/weekly-summary-card";
import { findWeeklySummary } from "~/domains/weekly-summary/services/weekly-summary-service";
import { weekStartOf } from "~/domains/weekly-summary/utils/weekly-summary";
import { CelebrationProvider } from "~/providers/celebration-provider";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { localDateString } from "~/shared/lib/dates";

export const metadata: Metadata = { title: "Início" };

export default function DashboardPage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<Suspense fallback={<HomeSkeleton />}>
				<HomeContent />
			</Suspense>
			{/* Separado: não segura o Início se o blog estiver lento. */}
			<Suspense fallback={null}>
				<LatestNews />
			</Suspense>
		</main>
	);
}

async function LatestNews() {
	return <NewsCard items={await getLatestNews()} />;
}

async function HomeContent() {
	const user = await getCurrentUser();
	const beta = isBetaUser(user);
	const today = localDateString();
	const [
		profile,
		goal,
		settings,
		meals,
		customFoods,
		measurements,
		templateFoods,
		calibration,
		checkins,
		dietCycle,
		weekly,
	] = await Promise.all([
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
		// Só lê: quem cria as refeições em branco é a aba Dieta.
		getDiet(user.id, { createIfEmpty: false }),
		listCustomFoods(user.id),
		listMeasurements(user.id),
		getTemplateFoods(user.id),
		findGoalCalibration(user.id),
		// Dois meses bastam pra sequência e semana do check-in.
		listCheckins(user.id, addDays(today, -60)),
		findDietCycle(user.id),
		beta ? findWeeklySummary(user.id, weekStartOf(today)) : null,
	]);

	// Gasto da fórmula + o ajuste pelo peso real já aplicado.
	const tdee = profile
		? calculateTdee(profile, settings.bmrFormula) + calibration.kcal
		: null;
	const mealsWithFoods = meals.filter((meal) => meal.items.length > 0).length;
	const calibrationAnalysis = goal
		? analyzeCalibration({
				weighIns: toWeighIns(measurements),
				today,
				since: calibration.since,
				calorieAdjustment: goal.calorieAdjustment,
				adherence: periodAdherence(
					checkins,
					mealsWithFoods,
					calibrationWindowStart(today, calibration.since),
					today,
				),
			})
		: null;
	// Revisões de 15 e 30 dias: no marco, o card da revisão substitui o do
	// ajuste pelo peso (mesma sugestão, com o balanço do período).
	const review =
		goal && dietCycle ? reviewStatus({ ...dietCycle, today }) : null;
	const reviewStart =
		dietCycle?.startedOn && dietCycle.startedOn > addDays(today, -60)
			? dietCycle.startedOn
			: addDays(today, -60);
	const targets =
		profile && goal && tdee !== null
			? calculateTargets(goal, {
					tdee,
					bmr: calculateBmr(profile, settings.bmrFormula),
					weightKg: profile.weightKg,
				})
			: null;
	const summary = summarizeDiet(meals, {
		weightKg: profile?.weightKg ?? null,
		tdee,
	});

	const steps: SetupStep[] = [
		{
			label: "Preencher seus dados",
			description: "Peso, altura, idade e rotina, para calcular seu gasto.",
			href: "/tmb",
			done: profile !== null,
		},
		{
			label: "Definir sua meta",
			description: "Perder, manter ou ganhar, e os macros do dia.",
			href: "/meta",
			done: goal !== null,
		},
		{
			label: "Montar sua dieta",
			description: "Refeições e alimentos, comparados com a meta.",
			href: "/dieta",
			done: meals.some((meal) => meal.items.length > 0),
		},
	];

	const attention: AttentionItem[] = [
		...(targets?.warnings ?? []).map((warning) => ({
			id: `goal-${warning}`,
			message: GOAL_WARNING_MESSAGES[warning],
			href: "/meta" as const,
			action: "Ajustar meta",
		})),
		...suspiciousFoods(customFoods),
		...emptyMealItems(meals),
		...micronutrientItems(meals, ironTarget(profile)),
	];

	const hasFoods = meals.some((meal) => meal.items.length > 0);
	// Check-in só das refeições com alimentos (as vazias viram aviso acima).
	const checkinMeals: CheckinMeal[] = meals
		.filter((meal) => meal.items.length > 0)
		.map((meal) => ({
			id: meal.id,
			name: meal.name,
			time: meal.time,
		}));
	const templates = (
		<DietTemplates
			templates={previewTemplates(
				templateFoods,
				targets && {
					protein: targets.protein.grams,
					carbs: targets.carbs.grams,
					fat: targets.fat.grams,
				},
				settings.proteinCounting,
			)}
			proteinCounting={settings.proteinCounting}
			currentMealCount={meals.length}
			hasCurrentFoods={hasFoods}
		/>
	);

	const firstName = user.name.split(" ")[0];

	return (
		<CelebrationProvider enabled={settings.celebrations}>
			<h1 className="font-heading font-semibold text-2xl sm:text-3xl">
				Olá, {firstName}
			</h1>

			<SetupChecklist steps={steps} />
			<AttentionList items={attention} />
			{checkinMeals.length > 0 && (
				<CheckinCard
					meals={checkinMeals}
					today={today}
					initialCheckins={checkins}
				/>
			)}
			{/* Sem dieta ainda: as prontas são o atalho mais útil, vêm antes. */}
			{!hasFoods && templates}

			{beta && <WeeklySummaryCard initialSummary={weekly} />}

			{targets && (
				<PlanOverview
					summary={summary}
					targets={targets}
					proteinCounting={settings.proteinCounting}
				/>
			)}
			{calibrationAnalysis && review?.due ? (
				<DietReviewCard
					status={review}
					analysis={calibrationAnalysis}
					weight={
						dietCycle?.startedOn
							? weightSince(toWeighIns(measurements), dietCycle.startedOn)
							: null
					}
					adherence={
						periodAdherence(checkins, mealsWithFoods, reviewStart, today)
							?.percent ?? null
					}
				/>
			) : (
				calibrationAnalysis && (
					<CalibrationCard
						analysis={calibrationAnalysis}
						calibration={calibration}
					/>
				)
			)}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
				{goal && targets && tdee !== null && (
					<GoalCard goal={goal} targets={targets} tdee={tdee} />
				)}
				{meals.length > 0 && <NextMealCard meals={meals} />}
				{calibrationAnalysis && review && !review.due && (
					<DietReviewCard
						status={review}
						analysis={calibrationAnalysis}
						weight={null}
						adherence={null}
					/>
				)}
				{profile && <WaterCard water={suggestedWater(profile)} />}
				<div className="sm:col-span-2">
					<MeasurementsCard measurements={measurements} />
				</div>
			</div>

			{hasFoods && templates}
		</CelebrationProvider>
	);
}

function HomeSkeleton() {
	return (
		<>
			<Skeleton className="h-9 w-48" />
			<Skeleton className="h-56 rounded-3xl" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Skeleton className="h-40 rounded-3xl" />
				<Skeleton className="h-40 rounded-3xl" />
			</div>
		</>
	);
}

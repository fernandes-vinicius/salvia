import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { summarizeDiet } from "~/domains/diet";
import { getDiet } from "~/domains/diet/services/diet-service";
import { listCustomFoods } from "~/domains/food/services/food-service";
import { calculateTargets } from "~/domains/goal";
import { GOAL_WARNING_MESSAGES } from "~/domains/goal/components/goal-warnings";
import { findGoalByUserId } from "~/domains/goal/services/goal-service";
import { AttentionList } from "~/domains/home/components/attention-list";
import { GoalCard } from "~/domains/home/components/goal-card";
import { MeasurementsCard } from "~/domains/home/components/measurements-card";
import { NextMealCard } from "~/domains/home/components/next-meal-card";
import { PlanOverview } from "~/domains/home/components/plan-overview";
import {
	SetupChecklist,
	type SetupStep,
} from "~/domains/home/components/setup-checklist";
import {
	type AttentionItem,
	emptyMealItems,
	suspiciousFoods,
} from "~/domains/home/utils/home";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_TAGLINE } from "~/shared/lib/app-config";

export default function HomePage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<Suspense fallback={<HomeSkeleton />}>
				<HomeContent />
			</Suspense>
		</main>
	);
}

async function HomeContent() {
	const user = await getCurrentUser();
	const [profile, goal, settings, meals, customFoods, measurements] =
		await Promise.all([
			findProfileByUserId(user.id),
			findGoalByUserId(user.id),
			getSettingsByUserId(user.id),
			// Só lê: quem cria as refeições em branco é a aba Dieta.
			getDiet(user.id, { createIfEmpty: false }),
			listCustomFoods(user.id),
			listMeasurements(user.id),
		]);

	const tdee = profile ? calculateTdee(profile, settings.bmrFormula) : null;
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
	];

	const firstName = user.name.split(" ")[0];

	return (
		<>
			<header className="flex flex-col gap-1">
				<h1 className="font-heading font-semibold text-2xl sm:text-3xl">
					Olá, {firstName}
				</h1>
				<p className="text-muted-foreground text-sm">{APP_TAGLINE}</p>
			</header>

			<SetupChecklist steps={steps} />
			<AttentionList items={attention} />

			{targets && <PlanOverview summary={summary} targets={targets} />}

			<div className="grid gap-4 sm:grid-cols-2 sm:items-start">
				{goal && targets && tdee !== null && (
					<GoalCard goal={goal} targets={targets} tdee={tdee} />
				)}
				{meals.length > 0 && <NextMealCard meals={meals} />}
				<div className="sm:col-span-2">
					<MeasurementsCard measurements={measurements} />
				</div>
			</div>
		</>
	);
}

function HomeSkeleton() {
	return (
		<>
			<Skeleton className="h-9 w-48" />
			<Skeleton className="h-56 rounded-3xl" />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-40 rounded-3xl" />
				<Skeleton className="h-40 rounded-3xl" />
			</div>
		</>
	);
}

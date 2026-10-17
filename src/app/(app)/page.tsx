import Link from "next/link";
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
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import {
	Flame,
	type LucideIcon,
	Salad,
	Target,
} from "~/shared/components/icons";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_TAGLINE } from "~/shared/lib/app-config";

const shortcuts: {
	href: "/tmb" | "/meta" | "/dieta";
	title: string;
	icon: LucideIcon;
}[] = [
	{ href: "/tmb", title: "TMB", icon: Flame },
	{ href: "/meta", title: "Meta", icon: Target },
	{ href: "/dieta", title: "Dieta", icon: Salad },
];

export default function HomePage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<Suspense fallback={<HomeSkeleton />}>
				<HomeContent />
			</Suspense>

			<nav aria-label="Atalhos" className="grid grid-cols-3 gap-3">
				{shortcuts.map(({ href, title, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 font-medium text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
							<Icon className="size-4" />
						</span>
						{title}
					</Link>
				))}
			</nav>
		</main>
	);
}

async function HomeContent() {
	const user = await getCurrentUser();
	const [profile, goal, settings, meals, customFoods] = await Promise.all([
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
		// Só lê: quem cria as refeições em branco é a aba Dieta.
		getDiet(user.id, { createIfEmpty: false }),
		listCustomFoods(user.id),
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
				{meals.length > 0 && <NextMealCard meals={meals} />}
				{goal && targets && tdee !== null && (
					<GoalCard goal={goal} targets={targets} tdee={tdee} />
				)}
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

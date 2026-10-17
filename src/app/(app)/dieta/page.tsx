import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { DietView } from "~/domains/diet";
import { getDiet } from "~/domains/diet/services/diet-service";
import { calculateTargets } from "~/domains/goal";
import { findGoalByUserId } from "~/domains/goal/services/goal-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Dieta" };

export default function DietaPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Dieta"
				description="Suas refeições e o total do dia comparado com a sua meta."
			/>
			<Suspense fallback={<DietSkeleton />}>
				<DietContent />
			</Suspense>
		</main>
	);
}

async function DietContent() {
	const user = await getCurrentUser();
	const [meals, profile, goal, settings] = await Promise.all([
		getDiet(user.id),
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
	]);

	// Gasto e meta vêm das abas TMB e Meta; sem eles, a grade funciona mas o
	// resumo não mostra excedente nem comparação com a meta.
	const tdee = profile ? calculateTdee(profile, settings.bmrFormula) : null;
	const targets =
		profile && goal && tdee !== null
			? calculateTargets(goal, {
					tdee,
					bmr: calculateBmr(profile, settings.bmrFormula),
					weightKg: profile.weightKg,
				})
			: null;

	return (
		<DietView
			// Remonta quando o servidor devolve outras refeições (ex.: depois de
			// `router.refresh()` por mudança em outra aba).
			key={meals.map((meal) => meal.id).join(",")}
			initialMeals={meals}
			weightKg={profile?.weightKg ?? null}
			tdee={tdee}
			targets={targets}
		/>
	);
}

function DietSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-64 rounded-3xl" />
				<Skeleton className="h-64 rounded-3xl" />
			</div>
			<Skeleton className="h-40 rounded-3xl" />
			<Skeleton className="h-40 rounded-3xl" />
		</div>
	);
}

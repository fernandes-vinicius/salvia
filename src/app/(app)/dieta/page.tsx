import type { Metadata } from "next";
import { Suspense } from "react";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { suggestedWater } from "~/domains/calculators/utils/water";
import { DietView } from "~/domains/diet";
import { getDiet } from "~/domains/diet/services/diet-service";
import { ironTarget } from "~/domains/diet/utils/micronutrients";
import { calculateTargets } from "~/domains/goal";
import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import { countSavedByMeal } from "~/domains/meal-recipe/services/saved-recipe-service";
import { calculateBmr, calculateTdee } from "~/domains/profile";
import { findProfileByUserId } from "~/domains/profile/services/profile-service";
import { getSettingsByUserId } from "~/domains/settings/services/settings-service";
import { listUserPrices } from "~/domains/shopping/services/price-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Dieta" };

export default function DietaPage() {
	return (
		<main
			data-wide-page
			className="container-wide flex flex-col gap-8 print:max-w-none print:gap-0 print:p-0"
		>
			<PageHeader
				title="Dieta"
				description="Suas refeições e o total do dia comparado com a sua meta."
				className="print:hidden"
			/>
			<Suspense fallback={<DietSkeleton />}>
				<DietContent />
			</Suspense>
		</main>
	);
}

async function DietContent() {
	const user = await getCurrentUser();
	const beta = isBetaUser(user);
	const [meals, profile, goal, settings, calibration, savedRecipes, prices] =
		await Promise.all([
			getDiet(user.id),
			findProfileByUserId(user.id),
			findGoalByUserId(user.id),
			getSettingsByUserId(user.id),
			findGoalCalibration(user.id),
			beta ? countSavedByMeal(user.id) : {},
			listUserPrices(user.id),
		]);

	// Gasto e meta vêm das abas TMB e Meta; sem eles, a grade funciona mas o
	// resumo não mostra excedente nem comparação com a meta. O gasto inclui o
	// ajuste pelo peso real (aba Meta).
	const tdee = profile
		? calculateTdee(profile, settings.bmrFormula) + calibration.kcal
		: null;
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
			water={profile ? suggestedWater(profile) : null}
			beta={beta}
			initialSavedRecipes={savedRecipes}
			proteinCounting={settings.proteinCounting}
			ironGoal={ironTarget(profile)}
			userPrices={prices}
		/>
	);
}

function DietSkeleton() {
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
			<div className="grid gap-4 md:grid-cols-2 lg:order-last lg:grid-cols-1">
				<Skeleton className="h-64 rounded-3xl" />
				<Skeleton className="h-64 rounded-3xl" />
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-48 rounded-3xl" />
				<Skeleton className="h-48 rounded-3xl" />
				<Skeleton className="h-48 rounded-3xl" />
			</div>
		</div>
	);
}

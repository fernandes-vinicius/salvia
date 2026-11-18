import type { Metadata } from "next";
import { Suspense } from "react";

import { AiQuotaProvider } from "~/domains/ai-usage/components/ai-quota-provider";
import {
	aiInterests,
	monthlyQuotaLeft,
} from "~/domains/ai-usage/services/ai-usage-service";
import { canUseAi } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { suggestedWater } from "~/domains/calculators/utils/water";
import { DietView } from "~/domains/diet";
import { dietVariants, getDiet } from "~/domains/diet/services/diet-service";
import { diffDraft } from "~/domains/diet/utils/diet-draft";
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
import { listSupplements } from "~/domains/supplements/services/supplement-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Dieta" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DietaPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
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
				<DietContent searchParams={searchParams} />
			</Suspense>
		</main>
	);
}

async function DietContent({ searchParams }: { searchParams: SearchParams }) {
	const user = await getCurrentUser();
	const beta = canUseAi(user);
	const wantsDraft = (await searchParams).versao === "rascunho";
	const [
		meals,
		profile,
		goal,
		settings,
		calibration,
		savedRecipes,
		prices,
		quota,
		interested,
		supplements,
	] = await Promise.all([
		getDiet(user.id),
		findProfileByUserId(user.id),
		findGoalByUserId(user.id),
		getSettingsByUserId(user.id),
		findGoalCalibration(user.id),
		beta ? countSavedByMeal(user.id) : {},
		listUserPrices(user.id),
		beta ? monthlyQuotaLeft(user) : {},
		beta ? aiInterests(user.id) : [],
		listSupplements(user.id),
	]);
	const versions = await dietVariants(user.id);
	const draftMeals = versions.draft
		? await getDiet(user.id, { variant: "draft", createIfEmpty: false })
		: null;
	const showDraft = wantsDraft && draftMeals !== null;

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
		<AiQuotaProvider initial={quota} interested={interested}>
			<DietView
				// Remonta quando o servidor devolve outras refeições (ex.: depois de
				// `router.refresh()` por mudança em outra aba).
				key={(showDraft ? draftMeals : meals).map((meal) => meal.id).join(",")}
				initialMeals={showDraft ? draftMeals : meals}
				draft={showDraft ? { base: meals } : null}
				versions={{
					draftChanges: draftMeals ? diffDraft(meals, draftMeals).count : null,
					previous: versions.previous,
				}}
				weightKg={profile?.weightKg ?? null}
				tdee={tdee}
				targets={targets}
				water={profile ? suggestedWater(profile) : null}
				beta={beta}
				initialSavedRecipes={savedRecipes}
				proteinCounting={settings.proteinCounting}
				ironGoal={ironTarget(profile)}
				userPrices={prices}
				initialSupplements={supplements}
			/>
		</AiQuotaProvider>
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

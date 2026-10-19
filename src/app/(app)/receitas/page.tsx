import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import { SavedRecipes } from "~/domains/meal-recipe";
import { listSavedRecipes } from "~/domains/meal-recipe/services/saved-recipe-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Minhas receitas" };

export default function SavedRecipesPage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<PageHeader
				title="Minhas receitas"
				description="As receitas sugeridas com as suas refeições que você salvou."
			/>
			<Suspense fallback={<SavedRecipesSkeleton />}>
				<SavedRecipesContent />
			</Suspense>
		</main>
	);
}

// Beta fechado, como a geração de receitas (as actions checam de novo).
async function SavedRecipesContent() {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) notFound();
	const [recipes, meals] = await Promise.all([
		listSavedRecipes(user.id),
		getDiet(user.id, { createIfEmpty: false }),
	]);
	return <SavedRecipes initialRecipes={recipes} meals={meals} />;
}

function SavedRecipesSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<Skeleton className="h-36 rounded-3xl" />
			<Skeleton className="h-36 rounded-3xl" />
		</div>
	);
}

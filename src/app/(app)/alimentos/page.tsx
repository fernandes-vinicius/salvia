import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { MyFoods } from "~/domains/food";
import { listCustomFoods } from "~/domains/food/services/food-service";
import { PageHeader } from "~/shared/components/page-header";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Meus alimentos" };

export default function AlimentosPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Meus alimentos"
				description="Alimentos que você cadastrou pelo rótulo. Os da Tabela TACO não podem ser editados."
			/>
			<Suspense fallback={<FoodsSkeleton />}>
				<FoodsContent />
			</Suspense>
		</main>
	);
}

async function FoodsContent() {
	const user = await getCurrentUser();
	const foods = await listCustomFoods(user.id);
	return <MyFoods initialFoods={foods} />;
}

function FoodsSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-9 w-44 self-end rounded-full" />
			<Skeleton className="h-20 rounded-2xl" />
			<Skeleton className="h-20 rounded-2xl" />
			<Skeleton className="h-20 rounded-2xl" />
		</div>
	);
}

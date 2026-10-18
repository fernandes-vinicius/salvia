import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { getDiet } from "~/domains/diet/services/diet-service";
import { ShoppingList } from "~/domains/shopping";
import { ChevronLeft, ShoppingCart } from "~/shared/components/icons";
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

export const metadata: Metadata = { title: "Lista de compras" };

export default function ShoppingListPage() {
	return (
		<main className="container-wrapper flex flex-col gap-6 print:max-w-none print:p-0">
			<div className="flex flex-col gap-3 print:hidden">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 self-start"
					nativeButton={false}
					render={<Link href="/dieta" />}
				>
					<ChevronLeft data-icon="inline-start" />
					Dieta
				</Button>
				<PageHeader
					title="Lista de compras"
					description="Tudo o que a sua dieta pede pro período escolhido, separado por seção do mercado."
				/>
			</div>
			<Suspense fallback={<ShoppingListSkeleton />}>
				<ShoppingListContent />
			</Suspense>
		</main>
	);
}

async function ShoppingListContent() {
	const user = await getCurrentUser();
	const meals = await getDiet(user.id, { createIfEmpty: false });

	if (!meals.some((meal) => meal.items.length > 0)) {
		return (
			<Empty className="rounded-2xl bg-card">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full bg-secondary text-primary"
					>
						<ShoppingCart />
					</EmptyMedia>
					<EmptyTitle>Sua dieta ainda está vazia</EmptyTitle>
					<EmptyDescription>
						A lista sai dos alimentos da sua dieta. Monte as refeições (ou use
						uma dieta pronta no Início) e volte aqui.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						nativeButton={false}
						render={<Link href="/dieta">Montar dieta</Link>}
					/>
				</EmptyContent>
			</Empty>
		);
	}

	return <ShoppingList meals={meals} />;
}

function ShoppingListSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-9 w-full max-w-md rounded-full" />
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-48 rounded-3xl" />
				<Skeleton className="h-48 rounded-3xl" />
			</div>
		</div>
	);
}

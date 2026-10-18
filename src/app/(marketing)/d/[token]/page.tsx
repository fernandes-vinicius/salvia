import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DietPreview } from "~/domains/diet/components/diet-preview";
import { getSharedDiet } from "~/domains/diet/services/diet-share-service";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_NAME } from "~/shared/lib/app-config";
import { formatNumber } from "~/shared/lib/format";

// Dieta compartilhada por link (menu ⋮ da Dieta): só leitura, sem nome nem
// dados de quem compartilhou, fora da busca.
export const metadata: Metadata = {
	title: "Dieta compartilhada",
	description: `Plano de refeições montado no ${APP_NAME}.`,
	robots: { index: false, follow: false },
};

export default function SharedDietPage({ params }: PageProps<"/d/[token]">) {
	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
			{/* Título fixo no HTML inicial (LCP); os dados chegam em streaming. */}
			<header className="flex flex-col gap-3">
				<p className="font-medium text-primary text-sm">Dieta compartilhada</p>
				<h1 className="text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
					Um dia de refeições montado no {APP_NAME}
				</h1>
			</header>
			<Suspense fallback={<SharedDietSkeleton />}>
				<SharedDiet params={params} />
			</Suspense>
		</main>
	);
}

async function SharedDiet({ params }: Pick<PageProps<"/d/[token]">, "params">) {
	const { token } = await params;
	const meals = await getSharedDiet(token);
	if (!meals) notFound();

	const filled = meals.filter((meal) => meal.items.length > 0);
	const { kcal, lines } = summarizeDiet(filled, { weightKg: null, tdee: null });
	const totals = [
		{ label: "kcal", value: kcal },
		{
			label: "proteína",
			value: lines.proteinAnimal.grams + lines.proteinVegetal.grams,
			unit: "g",
		},
		{ label: "carboidrato", value: lines.carbs.grams, unit: "g" },
		{ label: "gordura", value: lines.fat.grams, unit: "g" },
	];

	return (
		<>
			<dl className="-mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
				{totals.map((item) => (
					<div key={item.label} className="rounded-2xl bg-card px-4 py-3">
						<dt className="text-muted-foreground text-xs">{item.label}</dt>
						<dd className="font-heading font-semibold text-xl tabular-nums">
							{formatNumber(item.value)}
							{item.unit && (
								<span className="ml-0.5 font-normal text-muted-foreground text-sm">
									{item.unit}
								</span>
							)}
						</dd>
					</div>
				))}
			</dl>

			{filled.length > 0 ? (
				<section aria-labelledby="refeicoes">
					<h2 id="refeicoes" className="sr-only">
						Refeições
					</h2>
					<DietPreview meals={filled} />
				</section>
			) : (
				<p className="rounded-3xl bg-card p-5 text-muted-foreground">
					Esta dieta ainda não tem alimentos.
				</p>
			)}

			<section className="flex flex-col items-start gap-3 rounded-3xl bg-primary p-5 text-primary-foreground md:p-6">
				<h2 className="font-heading font-semibold text-xl">
					Monte a sua, com as suas metas
				</h2>
				<p className="text-pretty text-sm">
					No {APP_NAME} você calcula quanto gasta por dia, define a meta e monta
					a dieta batendo proteína, carboidrato e gordura, com a tabela TACO.
					Grátis.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="secondary"
						nativeButton={false}
						render={<Link href="/login" />}
					>
						Montar minha dieta
					</Button>
					<Button
						variant="ghost"
						className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
						nativeButton={false}
						render={<Link href="/calculadoras/macros" />}
					>
						Calcular minhas metas
					</Button>
				</div>
			</section>

			<p className="text-muted-foreground text-xs">
				Plano montado por quem usa o {APP_NAME}, a partir das metas dessa
				pessoa. Não é prescrição: pra saber as suas, use as calculadoras ou
				procure um nutricionista.
			</p>
		</>
	);
}

// Mesma altura dos totais e ocupa a tela toda, pra nada pular quando os
// dados chegam (CLS).
function SharedDietSkeleton() {
	return (
		<>
			<div className="-mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
				<Skeleton className="h-[4.25rem] rounded-2xl" />
				<Skeleton className="h-[4.25rem] rounded-2xl" />
				<Skeleton className="h-[4.25rem] rounded-2xl" />
				<Skeleton className="h-[4.25rem] rounded-2xl" />
			</div>
			<Skeleton className="min-h-svh rounded-3xl" />
		</>
	);
}

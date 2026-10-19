import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RecipeView } from "~/domains/meal-recipe/components/recipe-view";
import { getSharedRecipe } from "~/domains/meal-recipe/services/saved-recipe-service";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_NAME } from "~/shared/lib/app-config";

const noIndex = { index: false, follow: false };

// Título e foto da receita na prévia do link (WhatsApp, LinkedIn…). Fora da
// busca (`noindex`), mas liberada no robots.txt: o robô do LinkedIn obedece
// o robots e sem acesso não monta a prévia.
export async function generateMetadata({
	params,
}: PageProps<"/r/[token]">): Promise<Metadata> {
	const { token } = await params;
	const recipe = await getSharedRecipe(token);
	if (!recipe) return { title: "Receita compartilhada", robots: noIndex };
	const images = recipe.photo
		? [{ url: recipe.photo.url, width: 960, height: 540, alt: recipe.title }]
		: undefined;
	return {
		title: recipe.title,
		description: recipe.summary,
		robots: noIndex,
		openGraph: {
			type: "article",
			title: recipe.title,
			description: recipe.summary,
			...(images && { images }),
		},
		twitter: { card: "summary_large_image", ...(images && { images }) },
	};
}

// Receita compartilhada por link (Minhas receitas → Compartilhar): só
// leitura, sem nome nem dieta de quem compartilhou.
export default function SharedRecipePage({ params }: PageProps<"/r/[token]">) {
	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
			<p className="font-medium text-primary text-sm">
				Receita compartilhada no {APP_NAME}
			</p>
			<Suspense fallback={<SharedRecipeSkeleton />}>
				<SharedRecipe params={params} />
			</Suspense>
		</main>
	);
}

async function SharedRecipe({
	params,
}: Pick<PageProps<"/r/[token]">, "params">) {
	const { token } = await params;
	const recipe = await getSharedRecipe(token);
	if (!recipe) notFound();

	return (
		<>
			<div className="-mt-4 rounded-3xl bg-card p-4 md:p-6">
				<RecipeView
					recipe={recipe}
					snapshot={recipe}
					macrosLabel="Por porção"
					titleAs="h1"
				/>
			</div>

			<section className="flex flex-col items-start gap-3 rounded-3xl bg-primary p-5 text-primary-foreground md:p-6">
				<h2 className="font-heading font-semibold text-xl">
					Receitas com o que já está na sua dieta
				</h2>
				<p className="text-pretty text-sm">
					No {APP_NAME} você monta a dieta batendo proteína, carboidrato e
					gordura, e pede receitas que usam só os alimentos de cada refeição,
					sem mudar os macros. Grátis.
				</p>
				<Button
					variant="secondary"
					nativeButton={false}
					render={<Link href="/login" />}
				>
					Montar minha dieta
				</Button>
			</section>

			<p className="text-muted-foreground text-xs">
				Receita sugerida por IA a partir da dieta de quem usa o {APP_NAME}. Não
				é prescrição: as quantidades são as dessa pessoa.
			</p>
		</>
	);
}

// Mesmo tamanho da receita, pra nada pular quando os dados chegam (CLS).
function SharedRecipeSkeleton() {
	return (
		<div className="-mt-4 flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-6">
			<Skeleton className="aspect-video rounded-2xl" />
			<Skeleton className="h-8 w-3/4" />
			<Skeleton className="min-h-[60svh] rounded-2xl" />
		</div>
	);
}

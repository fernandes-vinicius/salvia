import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isBetaUser } from "~/domains/auth/services/beta-service";
import { getCurrentUser } from "~/domains/auth/services/session-service";
import { DietImport } from "~/domains/diet-import";
import { ChevronLeft } from "~/shared/components/icons";
import { PageHeader } from "~/shared/components/page-header";
import { Button } from "~/shared/components/ui/button";
import { Skeleton } from "~/shared/components/ui/skeleton";

export const metadata: Metadata = { title: "Importar dieta" };

export default function ImportDietPage() {
	return (
		<main className="container-wrapper flex flex-col gap-6">
			<div className="flex flex-col gap-3">
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
					title="Importar dieta"
					description="Traga a dieta do seu nutricionista pro app sem digitar alimento por alimento."
				/>
			</div>
			<Suspense fallback={<Skeleton className="h-72 rounded-3xl" />}>
				<ImportContent />
			</Suspense>
		</main>
	);
}

// Beta fechado: quem não está em `BETA_EMAILS` não vê a página (as actions
// checam de novo no servidor).
async function ImportContent() {
	const user = await getCurrentUser();
	if (!isBetaUser(user)) notFound();
	return <DietImport />;
}

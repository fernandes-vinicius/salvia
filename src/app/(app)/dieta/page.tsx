import type { Metadata } from "next";

import { UtensilsCrossed } from "~/shared/components/icons";
import { PageHeader } from "~/shared/components/page-header";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/shared/components/ui/empty";

export const metadata: Metadata = { title: "Dieta" };

export default function DietaPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="Dieta"
				description="Suas refeições, alimentos e o total de macros do dia."
			/>
			<Empty className="rounded-2xl bg-card">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full bg-secondary text-primary"
					>
						<UtensilsCrossed />
					</EmptyMedia>
					<EmptyTitle>Nenhuma refeição ainda</EmptyTitle>
					<EmptyDescription>
						Em breve: monte suas refeições e acompanhe proteína, carboidrato e
						gordura em relação às metas.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</main>
	);
}

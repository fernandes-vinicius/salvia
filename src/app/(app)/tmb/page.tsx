import type { Metadata } from "next";

import { Flame } from "~/shared/components/icons";
import { PageHeader } from "~/shared/components/page-header";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/shared/components/ui/empty";

export const metadata: Metadata = { title: "TMB" };

export default function TmbPage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<PageHeader
				title="TMB"
				description="Seus dados para calcular a taxa metabólica e o gasto calórico diário."
			/>
			<Empty className="rounded-2xl bg-card">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full bg-secondary text-primary"
					>
						<Flame />
					</EmptyMedia>
					<EmptyTitle>Seus dados ainda não foram preenchidos</EmptyTitle>
					<EmptyDescription>
						Em breve: peso, altura, idade e fator de atividade para calcular seu
						gasto calórico diário.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</main>
	);
}

import type { Metadata } from "next";
import Link from "next/link";

import { BareShell } from "~/shared/components/bare-shell";
import { Calculator, House, SearchX } from "~/shared/components/icons";
import { StatusScreen } from "~/shared/components/status-screen";
import { Button } from "~/shared/components/ui/button";

export const metadata: Metadata = { title: "Página não encontrada" };

// Endereço que não existe (fora da área logada, que tem a sua). "Início"
// leva pra landing; quem tem sessão o proxy manda pro /dashboard.
export default function NotFound() {
	return (
		<BareShell>
			<StatusScreen
				icon={SearchX}
				code="404"
				title="Página não encontrada"
				description="O endereço pode ter mudado ou não existe mais. Confira se digitou certo ou volte pro início."
			>
				<Button nativeButton={false} render={<Link href="/" />}>
					<House data-icon="inline-start" />
					Ir pro início
				</Button>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link href="/calculadoras" />}
				>
					<Calculator data-icon="inline-start" />
					Ver calculadoras
				</Button>
			</StatusScreen>
		</BareShell>
	);
}

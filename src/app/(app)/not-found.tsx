import Link from "next/link";

import { House, Salad, SearchX } from "~/shared/components/icons";
import { StatusScreen } from "~/shared/components/status-screen";
import { Button } from "~/shared/components/ui/button";

// 404 dentro da área logada (ex.: recurso em beta não liberado, `notFound()`):
// mantém o cabeçalho e a barra de abas do layout.
export default function AppNotFound() {
	return (
		<main className="container-wrapper flex flex-1 flex-col">
			<StatusScreen
				icon={SearchX}
				code="404"
				title="Página não encontrada"
				description="Essa página não existe ou não está disponível pra sua conta."
			>
				<Button nativeButton={false} render={<Link href="/dashboard" />}>
					<House data-icon="inline-start" />
					Voltar pro Início
				</Button>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link href="/dieta" />}
				>
					<Salad data-icon="inline-start" />
					Ir pra Dieta
				</Button>
			</StatusScreen>
		</main>
	);
}

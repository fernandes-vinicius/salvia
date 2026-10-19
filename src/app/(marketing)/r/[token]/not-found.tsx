import Link from "next/link";

import { Button } from "~/shared/components/ui/button";
import { APP_NAME } from "~/shared/lib/app-config";

// Link desativado ou receita excluída (Minhas receitas → Compartilhar).
export default function SharedRecipeNotFound() {
	return (
		<main className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
			<h1 className="font-heading font-semibold text-3xl tracking-tight">
				Este link não está mais ativo
			</h1>
			<p className="text-pretty text-muted-foreground">
				Quem compartilhou a receita desativou o link ou excluiu a receita. Peça
				um link novo ou monte a sua dieta no {APP_NAME}.
			</p>
			<Button nativeButton={false} render={<Link href="/login" />}>
				Montar minha dieta
			</Button>
		</main>
	);
}

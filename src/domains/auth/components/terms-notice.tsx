import Link from "next/link";

import { APP_NAME } from "~/shared/lib/app-config";

export function TermsNotice({ action }: { action: string }) {
	return (
		<p className="text-balance text-muted-foreground text-xs leading-relaxed [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
			{action}, você concorda com os <Link href="/termos">Termos de uso</Link> e
			com a <Link href="/privacidade">Política de privacidade</Link>, incluindo
			o uso dos seus dados de corpo e dieta pra calcular o seu plano. O{" "}
			{APP_NAME} não substitui nutricionista.
		</p>
	);
}

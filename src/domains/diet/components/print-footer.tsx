import { Leaf } from "~/shared/components/icons";
import { APP_NAME, SITE_URL } from "~/shared/lib/app-config";

// Assinatura que só aparece no PDF: quem recebe a dieta impressa ou
// compartilhada sabe de onde ela veio e onde montar a própria.
export function PrintFooter() {
	return (
		<footer className="hidden print:mt-2 print:flex print:break-inside-avoid print:items-center print:justify-between print:gap-6 print:border-border print:border-t print:pt-3">
			<div className="flex items-center gap-2">
				<span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<Leaf className="size-3.5" />
				</span>
				<p className="text-sm">
					Feito com{" "}
					<span className="font-heading font-semibold">{APP_NAME}</span> · monte
					a sua grátis em <span className="font-semibold">{SITE_URL.host}</span>
				</p>
			</div>
			<p className="max-w-64 text-right text-muted-foreground text-xs">
				Ferramenta de planejamento. Não substitui nutricionista.
			</p>
		</footer>
	);
}

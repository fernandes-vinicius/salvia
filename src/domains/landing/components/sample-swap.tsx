import { equivalentQuantity } from "~/domains/diet/utils/diet";
// Imports diretos (não pelo barrel `~/domains/food`): o barrel também
// exporta os formulários de alimento e levaria zod/conform pro JS da landing.
import { MacroLine } from "~/domains/food/components/macro-line";
import { macrosFor } from "~/domains/food/utils/food";
import { arroz, batataDoce } from "~/domains/landing/utils/sample-data";
import { ArrowLeftRight, Copy } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

const MEALS = ["Café da manhã", "Almoço", "Pós-treino", "Jantar", "Ceia"];

// Recorte do painel do alimento (Substituir + Copiar para), com a quantidade
// equivalente calculada pela mesma função do app.
export function SampleSwap() {
	const before = { id: "arroz", quantity: 150, food: arroz };
	const equivalent = equivalentQuantity(before, batataDoce);
	const quantity = equivalent?.quantity ?? 100;

	return (
		<div className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5">
			<div className="flex items-center gap-2">
				<ArrowLeftRight className="size-4 text-primary" />
				<p className="font-heading font-semibold">Substituir alimento</p>
			</div>
			<dl className="grid gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground text-xs">
						Sai · {formatNumber(before.quantity)} g
					</dt>
					<dd className="flex flex-col gap-0.5">
						<span className="line-through decoration-muted-foreground/60">
							{arroz.name}
						</span>
						<MacroLine macros={macrosFor(arroz, before.quantity)} />
					</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground text-xs">
						Entra · {formatNumber(quantity)} g
					</dt>
					<dd className="flex flex-col gap-0.5">
						<span className="font-medium">{batataDoce.name}</span>
						<MacroLine macros={macrosFor(batataDoce, quantity)} />
					</dd>
				</div>
			</dl>
			{equivalent && (
				<p className="text-muted-foreground text-xs">
					Sugerimos a quantidade com os mesmos {formatNumber(equivalent.grams)}{" "}
					g de carboidrato de antes.
				</p>
			)}
			<div className="flex flex-col gap-2">
				<p className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
					<Copy className="size-3.5" />
					Copiar para
				</p>
				<div className="flex flex-wrap gap-2">
					{MEALS.map((meal) => (
						<Button key={meal} size="sm" variant="outline" tabIndex={-1}>
							{meal}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}

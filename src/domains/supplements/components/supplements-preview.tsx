import type {
	Supplement,
	SupplementMealRef,
} from "~/domains/supplements/types/supplement-types";
import {
	daysLabel,
	doseLabel,
	timingLabel,
} from "~/domains/supplements/utils/supplements";
import { Pill } from "~/shared/components/icons";

// Suplementação no Visualizar, no PDF e no link compartilhado: depois das
// refeições, só leitura. Sem estado (renderiza no servidor). Sem suplementos,
// não aparece.
export function SupplementsPreview({
	supplements,
	meals,
}: {
	supplements: Supplement[];
	meals: SupplementMealRef[];
}) {
	if (supplements.length === 0) return null;
	return (
		<section
			aria-labelledby="suplementacao"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5 print:break-inside-avoid print:border print:border-border"
		>
			<header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<h3
					id="suplementacao"
					className="flex items-center gap-2 font-heading font-semibold text-lg"
				>
					<Pill className="size-4 text-primary" aria-hidden />
					Suplementação
				</h3>
				<p className="text-muted-foreground text-sm">não entra nas calorias</p>
			</header>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left text-muted-foreground text-xs">
						<th className="pb-1.5 font-normal">Suplemento</th>
						<th className="pb-1.5 font-normal">Quando</th>
						<th className="hidden pb-1.5 font-normal sm:table-cell print:table-cell">
							Dias
						</th>
					</tr>
				</thead>
				<tbody>
					{supplements.map((supplement) => (
						<tr key={supplement.id} className="border-border border-t">
							<td className="py-2 pr-3 align-top leading-snug">
								<span className="font-medium">{supplement.name}</span>
								<span className="block text-muted-foreground tabular-nums">
									{doseLabel(supplement.dose, supplement.unit)}
								</span>
								{supplement.note && (
									<span className="block text-muted-foreground text-xs">
										{supplement.note}
									</span>
								)}
							</td>
							<td className="py-2 pr-3 align-top leading-snug">
								{timingLabel(supplement, meals)}
								{/* No celular os dias ficam embaixo do momento. */}
								<span className="block text-muted-foreground text-xs sm:hidden print:hidden">
									{daysLabel(supplement.days, supplement.weekdays)}
								</span>
							</td>
							<td className="hidden py-2 align-top leading-snug sm:table-cell print:table-cell">
								{daysLabel(supplement.days, supplement.weekdays)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}

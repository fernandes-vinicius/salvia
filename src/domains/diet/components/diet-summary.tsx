import type { DietSummary, MacroKey } from "~/domains/diet/types/diet-types";
import { MACRO_KEYS } from "~/domains/diet/utils/diet";
import { formatFixed, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

export const MACRO_LABELS: Record<MacroKey, { label: string; dot: string }> = {
	proteinAnimal: { label: "Proteína (A)", dot: "bg-macro-protein" },
	proteinVegetal: { label: "Proteína (V)", dot: "bg-macro-protein-vegetal" },
	carbs: { label: "Carboidrato", dot: "bg-macro-carb" },
	fat: { label: "Gordura", dot: "bg-macro-fat" },
};

interface DietSummaryCardProps {
	summary: DietSummary;
	tdee: number | null;
}

// A legenda "OFF" da planilha: g · % · kcal · g/kg por macro, total e
// excedente/déficit em relação ao gasto diário.
export function DietSummaryCard({ summary, tdee }: DietSummaryCardProps) {
	const { surplus } = summary;

	return (
		<section
			aria-label="Resumo do dia"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="font-heading font-semibold">Resumo do dia</h2>

			<table className="w-full text-sm tabular-nums">
				<thead>
					<tr className="text-muted-foreground text-xs">
						<th className="pb-2 text-left font-normal">
							<span className="sr-only">Macro</span>
						</th>
						<th className="w-12 pb-2 pl-2 text-right font-normal">g</th>
						<th className="w-12 pb-2 pl-2 text-right font-normal">%</th>
						<th className="w-12 pb-2 pl-2 text-right font-normal">kcal</th>
						<th className="w-12 pb-2 pl-2 text-right font-normal">g/kg</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{MACRO_KEYS.map((key) => {
						const line = summary.lines[key];
						return (
							<tr key={key}>
								<th scope="row" className="py-2 text-left font-normal">
									<span className="flex items-center gap-2 whitespace-nowrap">
										<span
											className={cn(
												"size-2 shrink-0 rounded-full",
												MACRO_LABELS[key].dot,
											)}
										/>
										{MACRO_LABELS[key].label}
									</span>
								</th>
								<td className="py-2 pl-2 text-right font-medium">
									{formatNumber(line.grams)}
								</td>
								<td className="py-2 pl-2 text-right text-muted-foreground">
									{formatNumber(line.percent)}
								</td>
								<td className="py-2 pl-2 text-right">
									{formatNumber(line.kcal)}
								</td>
								<td className="py-2 pl-2 text-right text-muted-foreground">
									{line.perKg === null ? "—" : formatFixed(line.perKg)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			<dl className="flex flex-col divide-y divide-border rounded-2xl bg-muted px-4 text-sm">
				<div className="flex items-center justify-between py-2.5">
					<dt className="text-muted-foreground">Total planejado</dt>
					<dd className="font-heading font-semibold tabular-nums">
						{formatNumber(summary.kcal)} kcal
					</dd>
				</div>
				{tdee !== null && surplus !== null && (
					<>
						<div className="flex items-center justify-between py-2.5">
							<dt className="text-muted-foreground">Gasto diário</dt>
							<dd className="tabular-nums">{formatNumber(tdee)} kcal</dd>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<dt className="text-muted-foreground">
								{surplus > 0 ? "Excedente" : "Déficit"}
							</dt>
							<dd className="font-heading font-semibold tabular-nums">
								{surplus > 0 ? "+" : "−"}
								{formatNumber(Math.abs(surplus))} kcal
							</dd>
						</div>
					</>
				)}
			</dl>
			{tdee === null && (
				<p className="text-muted-foreground text-xs">
					Preencha a aba TMB para ver o excedente ou déficit.
				</p>
			)}
		</section>
	);
}

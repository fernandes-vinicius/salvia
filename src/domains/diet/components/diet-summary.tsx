import Link from "next/link";
import type { WaterResult } from "~/domains/calculators/utils/water";
import type { DietSummary, MacroKey } from "~/domains/diet/types/diet-types";
import {
	FIBER_MIN_GRAMS,
	fiberTarget,
	MACRO_KEYS,
} from "~/domains/diet/utils/diet";
import { Droplet, Wheat } from "~/shared/components/icons";
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
	/** Custo estimado de 1 dia (R$); null sem preço. */
	costPerDay?: number | null;
	/** Água sugerida pelo perfil (peso e treinos); null sem perfil. */
	water?: WaterResult | null;
}

// A legenda "OFF" da planilha: g · % · kcal · g/kg por macro, total e
// excedente/déficit em relação ao gasto diário. Fibra fica à parte (não
// entra nas kcal), com a recomendação pro dia.
export function DietSummaryCard({
	summary,
	tdee,
	costPerDay = null,
	water = null,
}: DietSummaryCardProps) {
	const { surplus } = summary;
	const fiberGoal = fiberTarget(summary.kcal);
	const fiberLow = Math.round(summary.fiber) < fiberGoal;

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
					<tr>
						<th scope="row" className="py-2 text-left font-normal">
							<span className="flex items-center gap-2 whitespace-nowrap">
								<Wheat className="size-3.5 shrink-0 text-muted-foreground" />
								Fibras
							</span>
						</th>
						<td className="py-2 pl-2 text-right font-medium">
							{formatNumber(summary.fiber)}
						</td>
						<td
							colSpan={3}
							className="py-2 pl-2 text-right text-muted-foreground text-xs"
						>
							recomendado {formatNumber(fiberGoal)} g
						</td>
					</tr>
					{water && (
						<tr>
							<th scope="row" className="py-2 text-left font-normal">
								<span className="flex items-center gap-2 whitespace-nowrap">
									<Droplet className="size-3.5 shrink-0 text-muted-foreground" />
									Água
								</span>
							</th>
							<td className="py-2 pl-2 text-right font-medium">
								{formatFixed(water.recommendedMl / 1000)}
								<span className="ml-0.5 font-normal text-muted-foreground text-xs">
									L
								</span>
							</td>
							<td
								colSpan={3}
								className="py-2 pl-2 text-right text-muted-foreground text-xs"
							>
								mínimo {formatFixed(water.minimumMl / 1000)} L
							</td>
						</tr>
					)}
				</tbody>
			</table>

			<p className="text-pretty rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground text-xs leading-relaxed">
				{fiberLow ? (
					<>
						<strong className="font-semibold">
							Faltam {fiberGoal - Math.round(summary.fiber)} g de fibra.
						</strong>{" "}
						A OMS indica pelo menos {FIBER_MIN_GRAMS} g por dia; pras suas
						calorias, cerca de {formatNumber(fiberGoal)} g. Feijão, aveia,
						frutas com casca e verduras ajudam.
					</>
				) : (
					<>
						<strong className="font-semibold">Fibra no recomendado.</strong>{" "}
						Pelo menos {FIBER_MIN_GRAMS} g por dia (OMS), ou cerca de 14 g a
						cada 1.000 kcal.
					</>
				)}
			</p>

			<dl className="flex flex-col divide-y divide-border rounded-2xl bg-muted px-4 text-sm">
				<div className="flex items-center justify-between py-2.5">
					<dt className="text-muted-foreground">Total planejado</dt>
					<dd className="font-heading font-semibold tabular-nums">
						{formatNumber(summary.kcal)} kcal
					</dd>
				</div>
				{costPerDay !== null && (
					<div className="flex items-center justify-between py-2.5">
						<dt className="text-muted-foreground">Custo do dia</dt>
						<dd className="tabular-nums">
							<Link
								href="/dieta/lista-de-compras"
								className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								≈{" "}
								{costPerDay.toLocaleString("pt-BR", {
									style: "currency",
									currency: "BRL",
								})}
							</Link>
						</dd>
					</div>
				)}
				{tdee !== null && surplus !== null && (
					<>
						<div className="flex items-center justify-between py-2.5">
							<dt className="text-muted-foreground">Gasto diário</dt>
							<dd className="tabular-nums">{formatNumber(tdee)} kcal</dd>
						</div>
						<div className="flex items-center justify-between py-2.5">
							<dt className="text-muted-foreground">
								{surplus > 0 ? "Acima do gasto" : "Abaixo do gasto"}
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
					Preencha a aba TMB para ver quanto a dieta fica acima ou abaixo do seu
					gasto.
				</p>
			)}
		</section>
	);
}

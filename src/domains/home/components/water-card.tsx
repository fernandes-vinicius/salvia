import Link from "next/link";

import {
	BOTTLE_ML,
	GLASS_ML,
	type WaterResult,
} from "~/domains/calculators/utils/water";
import { Droplet } from "~/shared/components/icons";
import { formatFixed, formatNumber } from "~/shared/lib/format";

interface WaterCardProps {
	/** `suggestedWater` do perfil (peso + média de treino da semana). */
	water: WaterResult;
}

const liters = (ml: number) => formatFixed(ml / 1000);

// Água do dia no Início: o recomendado pelo peso e pelo treino da semana, em
// litros e copos, com o mínimo pro dia de descanso.
export function WaterCard({ water }: WaterCardProps) {
	return (
		<section
			aria-label="Água por dia"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="flex items-center gap-2 font-heading font-semibold">
				<Droplet className="size-4 text-primary" />
				Água por dia
			</h2>
			<div className="flex flex-col gap-1">
				<p className="font-heading font-semibold text-2xl tabular-nums">
					{liters(water.recommendedMl)} L
				</p>
				<p className="text-muted-foreground text-sm tabular-nums">
					~{formatNumber(Math.round(water.recommendedMl / GLASS_ML))} copos de{" "}
					{GLASS_ML} ml ou{" "}
					{formatNumber(Math.round(water.recommendedMl / BOTTLE_ML))} garrafas
					de {BOTTLE_ML} ml
				</p>
			</div>
			<p className="rounded-2xl bg-muted px-4 py-3 text-muted-foreground text-xs">
				Pelo seu peso e pelo treino da semana. No dia de descanso, fique perto
				do mínimo de{" "}
				<span className="font-medium text-foreground tabular-nums">
					{liters(water.minimumMl)} L
				</span>
				.
			</p>
			<Link
				href="/calculadoras/agua"
				className="self-start font-medium text-primary text-xs underline-offset-4 hover:underline"
			>
				Calcular com calor e suor
			</Link>
		</section>
	);
}

"use client";

import { useState } from "react";

import {
	BOTTLE_ML,
	type Climate,
	GLASS_ML,
	waterPerDay,
} from "~/domains/calculators/utils/water";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import { ChoiceCard } from "~/shared/components/choice-card";
import { FormSection } from "~/shared/components/form-section";
import {
	Droplet,
	Dumbbell,
	Leaf,
	type LucideIcon,
	Sun,
	Timer,
	Weight,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { RadioGroup } from "~/shared/components/ui/radio-group";
import { formatFixed, formatNumber } from "~/shared/lib/format";

const CLIMATES: {
	value: Climate;
	icon: LucideIcon;
	title: string;
	description: string;
}[] = [
	{
		value: "mild",
		icon: Leaf,
		title: "Clima ameno",
		description: "Treino em lugar fresco ou com ar-condicionado",
	},
	{
		value: "hot",
		icon: Sun,
		title: "Calor",
		description: "Dia quente ou academia abafada",
	},
	{
		value: "sweaty",
		icon: Droplet,
		title: "Suo muito",
		description: "Termina o treino com a roupa encharcada",
	},
];

const liters = (ml: number) => formatFixed(ml / 1000);

export function WaterCalculator() {
	const [weightKg, setWeightKg] = useState(75);
	const [trainingMinutes, setTrainingMinutes] = useState(60);
	const [climate, setClimate] = useState<Climate>("mild");

	const water = waterPerDay({ weightKg, trainingMinutes, climate });

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<section
				aria-label="Sua água por dia"
				className="sticky top-20 z-10 flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:order-2 md:p-5"
			>
				<p className="text-sm opacity-90">Recomendado em dia de treino</p>
				<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
					{liters(water.recommendedMl)}
					<span className="ml-1.5 font-normal text-lg opacity-90">litros</span>
				</p>
				<p className="text-sm tabular-nums opacity-90">
					~{formatNumber(Math.round(water.recommendedMl / GLASS_ML))} copos de{" "}
					{GLASS_ML} ml ou{" "}
					{formatNumber(Math.round(water.recommendedMl / BOTTLE_ML))} garrafas
					de {BOTTLE_ML} ml
				</p>

				<dl className="mt-3 flex flex-col divide-y divide-primary-foreground/15 rounded-2xl bg-primary-foreground/10 px-4 text-sm">
					<div className="flex items-center justify-between gap-3 py-2.5">
						<dt>Mínimo do dia</dt>
						<dd className="font-heading font-semibold tabular-nums">
							{liters(water.minimumMl)} L
						</dd>
					</div>
					<div className="flex items-center justify-between gap-3 py-2.5">
						<dt>Só pelo treino</dt>
						<dd className="font-heading font-semibold tabular-nums">
							+{liters(water.trainingMl)} L
						</dd>
					</div>
				</dl>
				<p className="mt-2 text-pretty text-xs">
					No dia de descanso, fique perto do mínimo. Durante o treino, vá
					bebendo aos poucos (um copo a cada 15–20 minutos).
				</p>
			</section>

			<div className="flex flex-col gap-8 md:order-1">
				<FormSection
					title="Seu peso"
					description="Arraste ou use − e + pra ajustar."
				>
					<MeasureSlider
						label="Peso"
						icon={Weight}
						unit="kg"
						value={weightKg}
						{...BODY_RANGES.weightKg}
						buttonStep={0.1}
						fractionDigits={1}
						onValueChange={setWeightKg}
					/>
				</FormSection>
				<FormSection
					title="Treino do dia"
					description="Musculação, cardio ou os dois somados. Coloque 0 se for dia de descanso."
				>
					<MeasureSlider
						label="Tempo de treino"
						icon={Timer}
						unit="min"
						value={trainingMinutes}
						min={0}
						max={180}
						step={15}
						buttonStep={5}
						onValueChange={setTrainingMinutes}
					/>
				</FormSection>
				<FormSection
					title="Como você sua"
					description="Calor e suor aumentam bastante a água que você perde."
				>
					<RadioGroup
						aria-label="Clima e suor"
						value={climate}
						onValueChange={(next) => setClimate(next as Climate)}
						className="gap-2"
					>
						{CLIMATES.map((option) => (
							<ChoiceCard
								key={option.value}
								value={option.value}
								icon={option.icon}
								title={option.title}
								description={option.description}
							/>
						))}
					</RadioGroup>
				</FormSection>
				<p className="flex items-start gap-2 text-muted-foreground text-sm">
					<Dumbbell className="mt-0.5 size-4 shrink-0" aria-hidden />
					Toma creatina? Ela leva água pro músculo, então vale ficar perto do
					recomendado todos os dias, não só nos de treino.
				</p>
			</div>
		</div>
	);
}

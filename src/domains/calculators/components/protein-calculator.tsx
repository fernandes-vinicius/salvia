"use client";

import { useState } from "react";

import { ObjectivePicker } from "~/domains/goal/components/objective-picker";
import type { Objective } from "~/domains/goal/types/goal-types";
import { MACRO_DEFAULTS } from "~/domains/goal/utils/goal";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import { FormSection } from "~/shared/components/form-section";
import { Drumstick, Egg, Milk, Weight } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { formatFixed, formatNumber } from "~/shared/lib/format";

/** Faixa de proteína pra quem treina (g/kg/dia), a mais citada nos estudos. */
const PROTEIN_RANGE = { min: 1.6, max: 2.2 };
const MEALS_PER_DAY = 4;

// Quanto de cada alimento dá uma refeição de proteína (valores da TACO e de
// um whey comum). `proteinPerUnit`: proteína por grama, ovo ou dose.
const EQUIVALENTS = [
	{
		icon: Drumstick,
		label: "peito de frango grelhado",
		proteinPerUnit: 0.32,
		format: (grams: number) => `${formatNumber(Math.round(grams / 10) * 10)} g`,
	},
	{
		icon: Egg,
		label: "ovos cozidos",
		// Ovo médio de 50 g, 13,3 g de proteína por 100 g.
		proteinPerUnit: 0.133 * 50,
		format: (units: number) => formatNumber(Math.round(units)),
	},
	{
		icon: Milk,
		label: "doses de whey (30 g)",
		proteinPerUnit: 0.8 * 30,
		format: (doses: number) => formatFixed(Math.round(doses * 2) / 2),
	},
];

export function ProteinCalculator() {
	const [weightKg, setWeightKg] = useState(75);
	const [objective, setObjective] = useState<Objective>("gain");

	const perKg = MACRO_DEFAULTS[objective].proteinPerKg;
	const daily = perKg * weightKg;
	const perMeal = daily / MEALS_PER_DAY;

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<section
				aria-label="Sua proteína por dia"
				className="sticky top-20 z-10 flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:order-2 md:p-5"
			>
				<p className="text-sm opacity-90">Proteína por dia</p>
				<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
					{formatNumber(daily)}
					<span className="ml-1.5 font-normal text-lg opacity-90">g</span>
				</p>
				<p className="text-sm tabular-nums opacity-90">
					{formatFixed(perKg)} g por kg · faixa{" "}
					{formatNumber(PROTEIN_RANGE.min * weightKg)}–
					{formatNumber(PROTEIN_RANGE.max * weightKg)} g
				</p>

				<div className="mt-3 flex flex-col gap-2 rounded-2xl bg-primary-foreground/10 p-4">
					<p className="text-sm">
						Em {MEALS_PER_DAY} refeições: ~
						<span className="font-heading font-semibold tabular-nums">
							{formatNumber(perMeal)} g
						</span>{" "}
						cada. Uma refeição dessas é mais ou menos:
					</p>
					<ul className="flex flex-col gap-1.5">
						{EQUIVALENTS.map((item) => (
							<li key={item.label} className="flex items-center gap-2 text-sm">
								<item.icon className="size-4 shrink-0" aria-hidden />
								<span>
									<span className="font-heading font-semibold tabular-nums">
										{item.format(perMeal / item.proteinPerUnit)}
									</span>{" "}
									{item.label}
								</span>
							</li>
						))}
					</ul>
				</div>
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
					title="Objetivo"
					description="Pra perder peso, a proteína mais alta ajuda a não perder músculo."
				>
					<ObjectivePicker value={objective} onValueChange={setObjective} />
				</FormSection>
			</div>
		</div>
	);
}

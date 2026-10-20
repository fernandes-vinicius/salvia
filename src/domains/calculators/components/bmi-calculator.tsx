"use client";

import { useState } from "react";

import {
	bmi,
	bmiCategory,
	healthyWeightRange,
} from "~/domains/calculators/utils/body-composition";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import { FormSection } from "~/shared/components/form-section";
import { Ruler, Weight } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { formatFixed, formatNumber } from "~/shared/lib/format";

export function BmiCalculator() {
	const [weightKg, setWeightKg] = useState(75);
	const [heightCm, setHeightCm] = useState(175);

	const value = bmi(weightKg, heightCm);
	const category = bmiCategory(value);
	const range = healthyWeightRange(heightCm);

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<section
				aria-label="Seu IMC"
				className="sticky top-20 z-10 flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:order-2 md:p-5"
			>
				<p className="text-sm opacity-90">Seu IMC</p>
				<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
					{formatFixed(value)}
				</p>
				<p className="font-medium">{category.label}</p>
				<p className="text-pretty text-sm opacity-90">{category.text}</p>

				<dl className="mt-3 flex flex-col rounded-2xl bg-primary-foreground/10 px-4 text-sm">
					<div className="flex items-center justify-between gap-3 py-2.5">
						<dt>Peso saudável pra sua altura</dt>
						<dd className="font-heading font-semibold tabular-nums">
							{formatNumber(range.min)}–{formatNumber(range.max)} kg
						</dd>
					</div>
				</dl>
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
				<FormSection title="Sua altura">
					<MeasureSlider
						label="Altura"
						icon={Ruler}
						unit="cm"
						value={heightCm}
						{...BODY_RANGES.heightCm}
						onValueChange={setHeightCm}
					/>
				</FormSection>
			</div>
		</div>
	);
}

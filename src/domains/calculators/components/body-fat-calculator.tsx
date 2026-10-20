"use client";

import { useState } from "react";

import {
	bodyFatCategory,
	bodyFatNavy,
} from "~/domains/calculators/utils/body-composition";
import { SexPicker } from "~/domains/profile/components/sex-picker";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import type { Sex } from "~/domains/profile/types/profile-types";
import { FormSection } from "~/shared/components/form-section";
import { PersonStanding, Ruler, Weight } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { formatFixed, formatNumber } from "~/shared/lib/format";

const TAPE = { step: 0.5, buttonStep: 0.5, fractionDigits: 1 } as const;

export function BodyFatCalculator() {
	const [sex, setSex] = useState<Sex>("male");
	const [weightKg, setWeightKg] = useState(75);
	const [heightCm, setHeightCm] = useState(175);
	const [neckCm, setNeckCm] = useState(38);
	const [waistCm, setWaistCm] = useState(85);
	const [hipsCm, setHipsCm] = useState(98);

	const percent = bodyFatNavy({
		sex,
		heightCm,
		neckCm,
		waistCm,
		hipsCm: sex === "female" ? hipsCm : undefined,
	});
	const category = percent === null ? null : bodyFatCategory(percent, sex);
	const fatKg = percent === null ? null : (weightKg * percent) / 100;

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<section
				aria-label="Seu percentual de gordura"
				className="sticky top-20 z-10 flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:order-2 md:p-5"
			>
				<p className="text-sm opacity-90">Gordura corporal estimada</p>
				{percent === null || category === null || fatKg === null ? (
					<p className="text-pretty text-sm">
						Confira as medidas: a cintura
						{sex === "female" ? " somada ao quadril" : ""} precisa ser maior que
						o pescoço.
					</p>
				) : (
					<>
						<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
							{formatFixed(percent)}
							<span className="ml-1 font-normal text-lg opacity-90">%</span>
						</p>
						<p className="font-medium">{category.label}</p>
						<p className="text-pretty text-sm opacity-90">{category.text}</p>
						<dl className="mt-3 flex flex-col divide-y divide-primary-foreground/15 rounded-2xl bg-primary-foreground/10 px-4 text-sm">
							<div className="flex items-center justify-between gap-3 py-2.5">
								<dt>Gordura</dt>
								<dd className="font-heading font-semibold tabular-nums">
									{formatNumber(fatKg, 1)} kg
								</dd>
							</div>
							<div className="flex items-center justify-between gap-3 py-2.5">
								<dt>Massa magra</dt>
								<dd className="font-heading font-semibold tabular-nums">
									{formatNumber(weightKg - fatKg, 1)} kg
								</dd>
							</div>
						</dl>
					</>
				)}
			</section>

			<div className="flex flex-col gap-8 md:order-1">
				<FormSection
					title="Sexo biológico"
					description="A fórmula muda: nas mulheres entra também o quadril."
				>
					<SexPicker value={sex} onValueChange={setSex} />
				</FormSection>
				<FormSection title="Peso e altura">
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
					<MeasureSlider
						label="Altura"
						icon={Ruler}
						unit="cm"
						value={heightCm}
						{...BODY_RANGES.heightCm}
						onValueChange={setHeightCm}
					/>
				</FormSection>
				<FormSection
					title="Medidas com fita métrica"
					description="Fita justa, sem apertar, de manhã e em jejum. Pescoço logo abaixo do pomo de adão; cintura na altura do umbigo, relaxado."
				>
					<MeasureSlider
						label="Pescoço"
						icon={PersonStanding}
						unit="cm"
						value={neckCm}
						min={25}
						max={60}
						{...TAPE}
						onValueChange={setNeckCm}
					/>
					<MeasureSlider
						label="Cintura"
						icon={PersonStanding}
						unit="cm"
						value={waistCm}
						min={50}
						max={160}
						{...TAPE}
						onValueChange={setWaistCm}
					/>
					{sex === "female" && (
						<MeasureSlider
							label="Quadril"
							icon={PersonStanding}
							unit="cm"
							value={hipsCm}
							min={60}
							max={170}
							{...TAPE}
							onValueChange={setHipsCm}
						/>
					)}
				</FormSection>
			</div>
		</div>
	);
}

"use client";

import type { Food } from "~/domains/food/types/food-types";
import { quantityRangeFor, UNIT_LABELS } from "~/domains/food/utils/food";
import {
	householdHint,
	householdMeasures,
} from "~/domains/food/utils/household";
import { Scale } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

interface QuantityEditorProps {
	unit: Food["unit"];
	/** Nome do alimento: liga as medidas caseiras (colher, concha, fatia). */
	name?: string;
	value: number;
	onChange: (value: number) => void;
}

/** Atalhos por medida: 1 a 4 da principal, 1 e 2 das outras. */
const MEASURE_COUNTS = [
	[1, 2, 3, 4],
	[1, 2],
];

// Slider + −/+ + atalhos comuns: ajustar porção sem digitar. Com medidas
// caseiras, mostra o equivalente ("≈ 4 colheres de sopa") e atalhos em
// colheres/conchas/fatias (convertidos pra gramas, que é o que fica salvo).
export function QuantityEditor({
	unit,
	name,
	value,
	onChange,
}: QuantityEditorProps) {
	const range = quantityRangeFor(unit);
	const short = UNIT_LABELS[unit].short;
	const food = { name: name ?? "", unit };
	const measures = name ? householdMeasures(food) : [];
	const hint = name ? householdHint(food, value) : null;

	const measureChips = measures.slice(0, 2).flatMap((measure, index) =>
		MEASURE_COUNTS[index]
			.map((count) => ({
				key: `${measure.short}-${count}`,
				label: `${formatNumber(count)} ${count > 1 ? (measure.shortPlural ?? measure.short) : measure.short}`,
				grams: Math.round(count * measure.grams),
			}))
			.filter((chip) => chip.grams >= range.min && chip.grams <= range.max),
	);

	return (
		<div className="flex flex-col gap-3">
			<MeasureSlider
				label="Quantidade"
				icon={Scale}
				unit={short}
				value={value}
				min={range.min}
				max={range.max}
				step={range.step}
				fractionDigits={unit === "unit" ? 1 : 0}
				caption={hint?.long}
				onValueChange={onChange}
			/>
			<div className="flex flex-wrap gap-2">
				{range.chips.map((chip) => (
					<Button
						key={chip}
						type="button"
						size="sm"
						variant={chip === value ? "default" : "secondary"}
						onClick={() => onChange(chip)}
					>
						{formatNumber(chip)} {short}
					</Button>
				))}
			</div>
			{measureChips.length > 0 && (
				<section
					aria-labelledby="household-measures"
					className="flex flex-col gap-2"
				>
					<h3
						id="household-measures"
						className="font-medium text-muted-foreground text-xs"
					>
						Em medidas caseiras (aproximado)
					</h3>
					<div className="flex flex-wrap gap-2">
						{measureChips.map((chip) => (
							<Button
								key={chip.key}
								type="button"
								size="sm"
								variant={chip.grams === value ? "default" : "outline"}
								onClick={() => onChange(chip.grams)}
							>
								{chip.label}
								<span className="text-xs tabular-nums opacity-75">
									{formatNumber(chip.grams)} {short}
								</span>
							</Button>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

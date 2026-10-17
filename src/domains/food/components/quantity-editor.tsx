"use client";

import type { Food } from "~/domains/food/types/food-types";
import { UNIT_LABELS } from "~/domains/food/utils/food";
import { Scale } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

const RANGES = {
	weight: { min: 5, max: 1000, step: 5, chips: [50, 100, 150, 200, 300] },
	unit: { min: 0.5, max: 20, step: 0.5, chips: [1, 2, 3, 4] },
} as const;

export function quantityRangeFor(unit: Food["unit"]) {
	return unit === "unit" ? RANGES.unit : RANGES.weight;
}

/** Quantidade padrão ao adicionar: 100 g/ml ou 1 unidade. */
export function defaultQuantityFor(unit: Food["unit"]) {
	return unit === "unit" ? 1 : 100;
}

interface QuantityEditorProps {
	unit: Food["unit"];
	value: number;
	onChange: (value: number) => void;
}

// Slider + −/+ + atalhos comuns: ajustar porção sem digitar.
export function QuantityEditor({ unit, value, onChange }: QuantityEditorProps) {
	const range = quantityRangeFor(unit);
	const short = UNIT_LABELS[unit].short;

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
		</div>
	);
}

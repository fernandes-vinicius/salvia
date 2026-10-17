"use client";

import type { Food } from "~/domains/food/types/food-types";
import { quantityRangeFor, UNIT_LABELS } from "~/domains/food/utils/food";
import { Scale } from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

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

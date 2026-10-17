"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { ReactNode } from "react";

import { type LucideIcon, Minus, Plus } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

interface MeasureSliderProps {
	label: string;
	icon: LucideIcon;
	unit: string;
	value: number;
	min: number;
	max: number;
	/** Passo ao arrastar. */
	step: number;
	/** Passo dos botões −/+ (ajuste fino); padrão = `step`. */
	buttonStep?: number;
	fractionDigits?: number;
	/** Mostra sempre `fractionDigits` casas (ex.: "1,0 g/kg"). */
	fixedDigits?: boolean;
	/** Texto de apoio abaixo do valor (ex.: "= 154 g por dia"). */
	caption?: ReactNode;
	onValueChange: (value: number) => void;
}

// Valor grande + botões −/+ pra ajuste fino + slider com polegar grande:
// pensado pra toque e pra quem não quer digitar número.
export function MeasureSlider({
	label,
	icon: Icon,
	unit,
	value,
	min,
	max,
	step,
	buttonStep = step,
	fractionDigits = 0,
	fixedDigits = false,
	caption,
	onValueChange,
}: MeasureSliderProps) {
	const minDigits = fixedDigits ? fractionDigits : 0;
	const format = (n: number) => formatNumber(n, fractionDigits, minDigits);
	const formatted = format(value);

	function change(next: number) {
		const rounded = Number(next.toFixed(fractionDigits));
		onValueChange(Math.min(max, Math.max(min, rounded)));
	}

	return (
		<div className="flex flex-col gap-4 rounded-2xl bg-card p-5">
			<span className="flex items-center gap-2 font-medium text-sm">
				<Icon className="size-4 text-primary" aria-hidden />
				{label}
			</span>

			<div className="flex items-center justify-between gap-4">
				<Button
					type="button"
					variant="secondary"
					size="icon-lg"
					className="rounded-full"
					aria-label={`Diminuir ${label.toLowerCase()}`}
					disabled={value <= min}
					onClick={() => change(value - buttonStep)}
				>
					<Minus />
				</Button>
				<div className="flex flex-col items-center gap-0.5">
					<output
						aria-live="polite"
						className="font-heading font-semibold text-4xl tabular-nums"
					>
						{formatted}
						<span className="ml-1 font-normal text-base text-muted-foreground">
							{unit}
						</span>
					</output>
					{caption && (
						<span className="text-muted-foreground text-xs tabular-nums">
							{caption}
						</span>
					)}
				</div>
				<Button
					type="button"
					variant="secondary"
					size="icon-lg"
					className="rounded-full"
					aria-label={`Aumentar ${label.toLowerCase()}`}
					disabled={value >= max}
					onClick={() => change(value + buttonStep)}
				>
					<Plus />
				</Button>
			</div>

			<SliderPrimitive.Root
				value={value}
				min={min}
				max={max}
				step={step}
				thumbAlignment="edge"
				onValueChange={(next) => change(next)}
			>
				<SliderPrimitive.Control className="relative flex h-8 w-full touch-none select-none items-center">
					<SliderPrimitive.Track className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
						<SliderPrimitive.Indicator className="h-full rounded-full bg-primary" />
					</SliderPrimitive.Track>
					<SliderPrimitive.Thumb
						getAriaLabel={() => label}
						getAriaValueText={(_, current) => `${format(current)} ${unit}`}
						className="size-6 rounded-full bg-primary outline-none ring-4 ring-card transition-[box-shadow] focus-visible:ring-ring/50 data-dragging:ring-ring/50"
					/>
				</SliderPrimitive.Control>
			</SliderPrimitive.Root>

			<div className="flex justify-between text-muted-foreground text-xs tabular-nums">
				<span>
					{format(min)} {unit}
				</span>
				<span>
					{format(max)} {unit}
				</span>
			</div>
		</div>
	);
}

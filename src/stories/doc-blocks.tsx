"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "~/shared/lib/utils";

// Blocos das páginas de fundamentos do Storybook. Os valores são lidos do CSS
// em tempo real (mudam com o tema claro/escuro da barra do Storybook), então
// a documentação nunca fica desatualizada em relação ao `globals.css`.

/** Cor CSS (qualquer formato, inclusive oklch) → RGB, via canvas. */
function toRgb(color: string): [number, number, number] | null {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1;
	const context = canvas.getContext("2d");
	if (!context) return null;
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 1);
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
	return [r, g, b];
}

function luminance([r, g, b]: [number, number, number]) {
	const channel = (value: number) => {
		const c = value / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string) {
	const rgbA = toRgb(a);
	const rgbB = toRgb(b);
	if (!rgbA || !rgbB) return null;
	const [high, low] = [luminance(rgbA), luminance(rgbB)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
}

const hex = (rgb: [number, number, number] | null) =>
	rgb
		? `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase()
		: "—";

/** Valor atual de uma variável CSS; acompanha a troca de tema. */
function useCssVar(name: string) {
	const [value, setValue] = useState("");
	useEffect(() => {
		const read = () =>
			setValue(
				getComputedStyle(document.documentElement)
					.getPropertyValue(`--${name}`)
					.trim(),
			);
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, [name]);
	return value;
}

interface SwatchProps {
	/** Nome do token sem `--` (ex.: "primary"). */
	token: string;
	description?: ReactNode;
	/** Token do texto que vai em cima dessa cor, pra mostrar o contraste. */
	on?: string;
}

export function ColorSwatch({ token, description, on }: SwatchProps) {
	const value = useCssVar(token);
	const onValue = useCssVar(on ?? token);
	const ratio = on && value && onValue ? contrast(value, onValue) : null;
	const rgb = value ? toRgb(value) : null;

	return (
		<div className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5">
			<div
				className="flex h-20 items-end p-3 font-medium text-sm"
				style={{
					background: `var(--${token})`,
					color: on ? `var(--${on})` : undefined,
				}}
			>
				{on && "Aa texto"}
			</div>
			<div className="flex flex-col gap-1 p-3 text-xs">
				<span className="font-semibold text-foreground text-sm">--{token}</span>
				<code className="text-muted-foreground">{hex(rgb)}</code>
				{ratio !== null && (
					<span
						className={cn(
							"font-medium tabular-nums",
							ratio >= 4.5 ? "text-primary" : "text-destructive",
						)}
					>
						Contraste com --{on}: {ratio.toFixed(2)}:1{" "}
						{ratio >= 4.5 ? "✓ AA" : "✗ abaixo de 4,5"}
					</span>
				)}
				{description && (
					<span className="text-muted-foreground">{description}</span>
				)}
			</div>
		</div>
	);
}

export function SwatchGrid({ children }: { children: ReactNode }) {
	return (
		<div className="not-prose my-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{children}
		</div>
	);
}

interface TypeSampleProps {
	label: string;
	className: string;
	children: ReactNode;
	usage: string;
}

export function TypeSample({
	label,
	className,
	children,
	usage,
}: TypeSampleProps) {
	return (
		<div className="not-prose flex flex-col gap-1 border-border border-b py-4 last:border-0">
			<div className="flex flex-wrap items-baseline justify-between gap-2 text-muted-foreground text-xs">
				<span className="font-semibold text-foreground">{label}</span>
				<code>{className}</code>
			</div>
			<p className={cn("text-foreground", className)}>{children}</p>
			<span className="text-muted-foreground text-xs">{usage}</span>
		</div>
	);
}

const RADII = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

export function RadiusScale() {
	return (
		<div className="not-prose my-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
			{RADII.map((radius) => (
				<div key={radius} className="flex flex-col items-center gap-2 text-xs">
					<div
						className="size-20 bg-secondary ring-1 ring-primary/20"
						style={{ borderRadius: `var(--radius-${radius})` }}
					/>
					<code className="text-foreground">rounded-{radius}</code>
				</div>
			))}
		</div>
	);
}

/** Bloco com o fundo do app (as páginas MDX usam o fundo do Storybook). */
export function Surface({ children }: { children: ReactNode }) {
	return (
		<div className="not-prose my-4 rounded-3xl bg-background p-4 text-foreground ring-1 ring-foreground/5">
			{children}
		</div>
	);
}

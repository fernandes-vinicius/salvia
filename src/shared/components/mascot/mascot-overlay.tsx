"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "~/shared/lib/utils";

const EXIT_MS = 360;

interface MascotOverlayProps {
	/** Big moment: center of the screen over a dark scrim. */
	center: boolean;
	/** The pot, sized by the class the overlay passes. */
	mascot: (className: string) => ReactNode;
	title: string;
	subtitle: string;
	/** Progress row under the text (meal dots, water bar…). */
	footer?: ReactNode;
	/** Extra layer behind the card in the center mode (e.g. rain). */
	backdrop?: ReactNode;
	/** How long it stays before leaving on its own (ms). */
	stayMs?: number;
	onDone: () => void;
}

// Stage for the mascot after the person does something: a small bubble above
// the tab bar, or the center of the screen for a goal. Leaves on its own or
// with a tap (Esc too in the center mode).
export function MascotOverlay({
	center,
	mascot,
	title,
	subtitle,
	footer,
	backdrop,
	stayMs = center ? 5200 : 2800,
	onDone,
}: MascotOverlayProps) {
	const [leaving, setLeaving] = useState(false);

	useEffect(() => {
		const leave = setTimeout(() => setLeaving(true), stayMs);
		return () => clearTimeout(leave);
	}, [stayMs]);

	useEffect(() => {
		if (!leaving) return;
		const done = setTimeout(onDone, EXIT_MS);
		return () => clearTimeout(done);
	}, [leaving, onDone]);

	useEffect(() => {
		if (!center) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setLeaving(true);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [center]);

	const label = `${title} ${subtitle} Toque para fechar.`;
	const motion = leaving
		? "motion-safe:animate-mascot-exit"
		: "motion-safe:animate-mascot-rise";

	if (center) {
		return createPortal(
			<output aria-live="polite" className="print:hidden">
				<button
					type="button"
					onClick={() => setLeaving(true)}
					aria-label={label}
					className={cn(
						"fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 px-6 supports-backdrop-filter:backdrop-blur-xs motion-safe:duration-300",
						leaving
							? "motion-safe:fade-out-0 motion-safe:animate-out motion-safe:fill-mode-forwards"
							: "motion-safe:fade-in-0 motion-safe:animate-in",
					)}
				>
					{backdrop}
					<span
						className={cn(
							"relative flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl bg-card px-6 pt-0 pb-6 text-center",
							motion,
						)}
					>
						{mascot("-mt-28 h-64 w-auto")}
						<span className="font-bold font-heading text-2xl leading-tight">
							{title}
						</span>
						<span className="text-muted-foreground leading-snug">
							{subtitle}
						</span>
						{footer && <span className="mt-2">{footer}</span>}
						<span className="mt-3 text-muted-foreground text-xs">
							Toque para continuar
						</span>
					</span>
				</button>
			</output>,
			document.body,
		);
	}

	return createPortal(
		<output
			aria-live="polite"
			className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-50 flex justify-center px-4 print:hidden"
		>
			<button
				type="button"
				onClick={() => setLeaving(true)}
				aria-label={label}
				className={cn(
					"pointer-events-auto flex w-full max-w-sm items-end gap-2 rounded-3xl bg-card py-3 pr-5 pl-2 text-left ring-1 ring-foreground/10",
					motion,
				)}
			>
				{mascot("-mt-20 h-40 w-auto shrink-0")}
				<span className="flex min-w-0 flex-col gap-1 pb-1">
					<span className="font-bold font-heading text-lg leading-tight">
						{title}
					</span>
					<span className="text-muted-foreground text-sm leading-snug">
						{subtitle}
					</span>
					{footer && <span className="mt-1">{footer}</span>}
				</span>
			</button>
		</output>,
		document.body,
	);
}

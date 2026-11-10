"use client";

import type { MascotMoment } from "~/domains/checkin/utils/mascot";
import { MascotOverlay } from "~/shared/components/mascot/mascot-overlay";
import { PotMascot } from "~/shared/components/mascot/pot-mascot";
import { cn } from "~/shared/lib/utils";

const MAX_DOTS = 8;

interface MascotCelebrationProps {
	moment: MascotMoment;
	followed: number;
	mealCount: number;
	onDone: () => void;
}

// The pot jumps in above the tab bar after a "Comi" and the newest leaf
// grows; on a complete day it blooms in the center of the screen. The row of
// dots shows how far the day is from the flower.
export function MascotCelebration({
	moment,
	followed,
	mealCount,
	onDone,
}: MascotCelebrationProps) {
	return (
		<MascotOverlay
			center={moment.bloom}
			title={moment.title}
			subtitle={moment.subtitle}
			onDone={onDone}
			mascot={(className) => (
				<PotMascot
					leaves={moment.leaves}
					bloom={moment.bloom}
					mood={moment.mood}
					animate
					className={className}
				/>
			)}
			footer={
				<Progress
					dots={Math.min(mealCount, MAX_DOTS)}
					filled={Math.min(followed, MAX_DOTS)}
					bloom={moment.bloom}
				/>
			}
		/>
	);
}

/** One dot per meal, ending in the flower (open once the day is complete). */
function Progress({
	dots,
	filled,
	bloom,
}: {
	dots: number;
	filled: number;
	bloom: boolean;
}) {
	return (
		<span aria-hidden className="flex items-center gap-1.5">
			{Array.from({ length: dots }, (_, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: one dot per meal
					key={i}
					className={cn(
						"size-2.5 rounded-full",
						i < filled ? "bg-primary" : "bg-muted",
						i === filled - 1 && "motion-safe:animate-pop",
					)}
				/>
			))}
			<FlowerDot open={bloom} />
		</span>
	);
}

function FlowerDot({ open }: { open: boolean }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			className={cn(
				"size-4",
				open ? "motion-safe:animate-pop" : "opacity-40 grayscale",
			)}
		>
			{Array.from({ length: 6 }, (_, i) => {
				const angle = (i * Math.PI) / 3;
				return (
					<circle
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed petals
						key={i}
						cx={10 + Math.cos(angle) * 5}
						cy={10 + Math.sin(angle) * 5}
						r={3.6}
						className="fill-macro-carb"
					/>
				);
			})}
			<circle cx={10} cy={10} r={3.2} className="fill-macro-fat" />
		</svg>
	);
}

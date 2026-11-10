"use client";

import { MAX_MASCOT_LEAVES } from "~/domains/checkin/utils/mascot";
import type { WaterMoment } from "~/domains/water/utils/water-moment";
import { MascotOverlay } from "~/shared/components/mascot/mascot-overlay";
import { usePlant } from "~/shared/components/mascot/plant-context";
import { PotMascot } from "~/shared/components/mascot/pot-mascot";
import { Progress } from "~/shared/components/ui/progress";

// Fixed spread so the rain looks random but renders the same every time.
const RAIN = Array.from({ length: 26 }, (_, i) => ({
	left: (i * 37) % 100,
	delay: (i * 173) % 1200,
	duration: 700 + ((i * 89) % 600),
	height: 12 + ((i * 7) % 14),
}));

interface WaterCelebrationProps {
	moment: WaterMoment;
	/** 0–100 of today's water goal. */
	percent: number;
	onDone: () => void;
}

// The same plant from the meal check-in gets watered after each glass; hitting
// the goal takes the center of the screen with rain behind it.
export function WaterCelebration({
	moment,
	percent,
	onDone,
}: WaterCelebrationProps) {
	const { plant } = usePlant();
	const leaves = Math.min(Math.max(plant.leaves, 1), MAX_MASCOT_LEAVES);

	return (
		<MascotOverlay
			center={moment.goal}
			stayMs={moment.goal ? 5200 : 2400}
			title={moment.title}
			subtitle={moment.subtitle}
			onDone={onDone}
			backdrop={moment.goal ? <Rain /> : undefined}
			mascot={(className) => (
				<PotMascot
					leaves={leaves}
					bloom={plant.bloom}
					mood={moment.goal ? "party" : "happy"}
					animate
					growLeaf={false}
					watering
					dew={moment.goal}
					className={className}
				/>
			)}
			footer={
				<Progress value={percent} aria-hidden className="w-40 max-w-full" />
			}
		/>
	);
}

function Rain() {
	return (
		<span aria-hidden className="pointer-events-none absolute inset-0">
			{RAIN.map((drop) => (
				<span
					key={drop.left * 10_000 + drop.delay}
					className="absolute -top-8 w-0.5 rounded-full bg-[#9FD3E3]/70 motion-safe:animate-rain motion-reduce:hidden"
					style={{
						left: `${drop.left}%`,
						height: drop.height,
						animationDelay: `${drop.delay}ms`,
						animationDuration: `${drop.duration}ms`,
					}}
				/>
			))}
		</span>
	);
}

import type { CSSProperties } from "react";

import { cn } from "~/shared/lib/utils";

// The pot is a character, so its clay and face keep the same colors in both
// themes (like a logo); leaves and flower follow the theme tokens.
const POT = "#C27C5A";
const RIM = "#A65F41";
const FACE = "#3B241A";
const CHEEK = "#E7A688";
const SOIL = "#5E4030";
const WET_SOIL = "#3A2619";
const WATER = "#9FD3E3";
const DROP =
	"M0 -5 C2.6 -1.6 3.4 0.6 3.4 1.6 A3.4 3.4 0 0 1 -3.4 1.6 C-3.4 0.6 -2.6 -1.6 0 -5 Z";

const RIM_TOP = 118;
const LEAF_STEP = 13;
const LEAF = "M0 0 C6 -12 20 -17 34 -13 C28 -1 14 4 0 0 Z";
const VEIN = "M3 -1.5 Q16 -6 28 -11";

// Rotates/scales around the point where the leaf meets the stem.
const LEAF_ORIGIN: CSSProperties = {
	transformBox: "fill-box",
	transformOrigin: "0% 87%",
};
const CENTER_ORIGIN: CSSProperties = {
	transformBox: "fill-box",
	transformOrigin: "50% 50%",
};

interface PotMascotProps {
	/** One leaf per meal followed (the stem grows with them). */
	leaves: number;
	/** Flower on top: the day is complete. */
	bloom?: boolean;
	mood?: "happy" | "party";
	/** Plays the hop, grows the newest leaf and opens the flower. */
	animate?: boolean;
	/** With `animate`: grow the newest leaf/flower (off when only watering). */
	growLeaf?: boolean;
	/** Watering can pouring over the pot, soil getting wet. */
	watering?: boolean;
	/** Water drops on the leaves (watered for the day). */
	dew?: boolean;
	className?: string;
}

/** Sálvia's mascot: a terracotta pot whose sprout grows during the day. */
export function PotMascot({
	leaves,
	bloom = false,
	mood = "happy",
	animate = false,
	growLeaf = true,
	watering = false,
	dew = false,
	className,
}: PotMascotProps) {
	const grow = animate && growLeaf;
	const stemTop = RIM_TOP - 22 - leaves * LEAF_STEP - (bloom ? 4 : 0);
	const stemHeight = RIM_TOP - stemTop;
	const newest = leaves - 1;
	const newestY = RIM_TOP - 16 - newest * LEAF_STEP;
	const newestSide = newest % 2 === 0 ? 1 : -1;
	const sparkleAt =
		bloom || !grow
			? { x: 80, y: stemTop }
			: { x: 80 + newestSide * 26, y: newestY - 8 };

	return (
		<svg
			viewBox="0 0 160 200"
			role="img"
			aria-label={
				bloom ? "Jarrinho do Sálvia florido" : "Jarrinho do Sálvia crescendo"
			}
			className={cn("overflow-visible", className)}
		>
			<g
				className={cn(animate && "motion-safe:animate-mascot-hop")}
				style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
			>
				<path
					d={`M80 ${RIM_TOP} C76 ${RIM_TOP - stemHeight * 0.35} 84 ${RIM_TOP - stemHeight * 0.7} 80 ${stemTop}`}
					fill="none"
					className="stroke-primary"
					strokeWidth={5}
					strokeLinecap="round"
				/>

				{Array.from({ length: leaves }, (_, i) => {
					const side = i % 2 === 0 ? 1 : -1;
					const scale = 1.05 - i * 0.05;
					const y = RIM_TOP - 16 - i * LEAF_STEP;
					return (
						<g
							// biome-ignore lint/suspicious/noArrayIndexKey: leaves are positional
							key={i}
							transform={`translate(${80 + side * 1.5} ${y}) scale(${side * scale} ${scale}) rotate(-8)`}
						>
							<g
								style={LEAF_ORIGIN}
								className={cn(
									grow && i === newest && "motion-safe:animate-leaf-grow",
								)}
							>
								<path
									d={LEAF}
									className={
										i % 2 === 0 ? "fill-primary" : "fill-macro-protein-vegetal"
									}
								/>
								<path
									d={VEIN}
									fill="none"
									className="stroke-card"
									strokeOpacity={0.55}
									strokeWidth={1.6}
									strokeLinecap="round"
								/>
								{dew && (
									<path
										d={DROP}
										transform="translate(19 -8) scale(0.7)"
										fill={WATER}
									/>
								)}
							</g>
						</g>
					);
				})}

				{bloom && (
					<g
						style={CENTER_ORIGIN}
						className={cn(grow && "motion-safe:animate-bloom")}
					>
						{Array.from({ length: 6 }, (_, i) => {
							const angle = (i * Math.PI) / 3;
							return (
								<circle
									// biome-ignore lint/suspicious/noArrayIndexKey: fixed petals
									key={i}
									cx={80 + Math.cos(angle) * 7.5}
									cy={stemTop + Math.sin(angle) * 7.5}
									r={6}
									className="fill-macro-carb"
								/>
							);
						})}
						<circle cx={80} cy={stemTop} r={5} className="fill-macro-fat" />
					</g>
				)}

				<path
					d="M42 136 L118 136 L109 190 Q108 196 100 196 L60 196 Q52 196 51 190 Z"
					fill={POT}
				/>
				<rect x={36} y={RIM_TOP} width={88} height={19} rx={5} fill={RIM} />
				<ellipse cx={80} cy={RIM_TOP + 1} rx={36} ry={3.2} fill={SOIL} />
				{watering && (
					<ellipse
						cx={80}
						cy={RIM_TOP + 1}
						rx={36}
						ry={3.2}
						fill={WET_SOIL}
						className="motion-safe:fade-in-0 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:delay-700 motion-safe:duration-700"
					/>
				)}
				<ellipse cx={60} cy={170} rx={6} ry={3.5} fill={CHEEK} />
				<ellipse cx={100} cy={170} rx={6} ry={3.5} fill={CHEEK} />
				<Face mood={mood} />
			</g>

			{watering && <WateringCan />}

			{(grow || dew) &&
				[
					{ dx: 0, dy: 0, r: 9, delay: 900 },
					{ dx: 18, dy: 14, r: 5, delay: 1080 },
					{ dx: -16, dy: 10, r: 6, delay: 1240 },
				].map((star) => (
					<path
						key={star.delay}
						d={sparkle(sparkleAt.x + star.dx, sparkleAt.y + star.dy, star.r)}
						className="fill-macro-carb opacity-0 motion-safe:animate-twinkle"
						style={{ ...CENTER_ORIGIN, animationDelay: `${star.delay}ms` }}
					/>
				))}
		</svg>
	);
}

// Tilts over the pot, pours a few drops and leaves.
function WateringCan() {
	return (
		<g>
			<g
				className="motion-safe:animate-can-pour"
				style={{ transformBox: "fill-box", transformOrigin: "60% 50%" }}
			>
				<g transform="translate(116 52) rotate(-22)">
					<path
						d="M30 8 Q42 8 42 20 Q42 30 32 30"
						fill="none"
						className="stroke-macro-carb-ink"
						strokeWidth={4}
						strokeLinecap="round"
					/>
					<rect
						x={4}
						y={4}
						width={30}
						height={28}
						rx={7}
						className="fill-macro-carb"
					/>
					<path d="M6 20 L-16 8 L-18 12 L4 28 Z" className="fill-macro-carb" />
					<rect
						x={-21}
						y={4}
						width={7}
						height={11}
						rx={2}
						transform="rotate(-30 -17 10)"
						className="fill-macro-carb-ink"
					/>
				</g>
			</g>
			{[0, 1, 2, 3].map((i) => (
				// The position lives on the group: the CSS animation replaces the
				// path's own transform.
				<g
					key={i}
					transform={`translate(${94 + (i % 2) * 6 - i} ${74 + (i % 2) * 4})`}
				>
					<path
						d={DROP}
						fill={WATER}
						className="opacity-0 motion-safe:animate-drop-fall"
						style={{ animationDelay: `${520 + i * 140}ms` }}
					/>
				</g>
			))}
		</g>
	);
}

function Face({ mood }: { mood: "happy" | "party" }) {
	if (mood === "party") {
		return (
			<g fill="none" stroke={FACE} strokeWidth={3.2} strokeLinecap="round">
				<path d="M60 160 Q67 151 74 160" />
				<path d="M86 160 Q93 151 100 160" />
				<path d="M71 170 Q80 186 89 170 Z" fill={FACE} strokeLinejoin="round" />
				<path
					d="M75.5 177 Q80 174 84.5 177 Q80 181 75.5 177 Z"
					fill={CHEEK}
					stroke="none"
				/>
			</g>
		);
	}
	return (
		<g>
			{[67, 93].map((x) => (
				<g key={x}>
					<ellipse cx={x} cy={158} rx={5} ry={6.2} fill={FACE} />
					<circle cx={x + 1.6} cy={155.6} r={1.7} fill="#F6F4EC" />
				</g>
			))}
			<path
				d="M72 172 Q80 179 88 172"
				fill="none"
				stroke={FACE}
				strokeWidth={3.2}
				strokeLinecap="round"
			/>
		</g>
	);
}

function sparkle(x: number, y: number, r: number) {
	const k = r * 0.28;
	return `M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z`;
}

import { waterAmountLabel } from "~/domains/water/utils/water-log";

export interface WaterMoment {
	/** Goal met: the pot takes the center of the screen. */
	goal: boolean;
	title: string;
	subtitle: string;
}

/** What the pot says after water is added (it gets watered). */
export function waterMoment({
	level,
	added,
	total,
	target,
	streak,
}: {
	level: "day" | "milestone" | null;
	added: number;
	total: number;
	target: number;
	streak: number;
}): WaterMoment {
	if (level === "milestone") {
		return {
			goal: true,
			title: `${streak} dias bebendo água!`,
			subtitle: "Meta de água batida. Sua plantinha agradece.",
		};
	}
	if (level === "day") {
		return {
			goal: true,
			title: "Plantinha hidratada!",
			subtitle:
				streak > 1
					? `${streak} dias seguidos na meta de água.`
					: "Meta de água de hoje batida.",
		};
	}
	const left = target - total;
	return {
		goal: false,
		title: `Regou! + ${waterAmountLabel(added)}`,
		subtitle:
			left > 0
				? `Faltam ${waterAmountLabel(left)} pra ela ficar hidratada.`
				: "Ela já está hidratada hoje.",
	};
}

export type PlantThirst = "thirsty" | "fine" | "hydrated";

/** Below this share of the goal the plant on the water card stays wilted. */
export const THIRSTY_BELOW = 0.5;

/** How the plant on the water card looks for today's water. */
export function plantThirst(total: number, target: number): PlantThirst {
	if (total >= target) return "hydrated";
	return total < target * THIRSTY_BELOW ? "thirsty" : "fine";
}

/** How the pot on the water card looks: leaves bend down when thirsty. */
export const THIRST_LOOK = {
	thirsty: { droop: 0, wilted: true, mood: "sad", label: "Plantinha com sede" },
	fine: { droop: 14, wilted: false, mood: "happy", label: "Plantinha bem" },
	hydrated: {
		droop: -10,
		wilted: false,
		mood: "party",
		label: "Plantinha hidratada",
	},
} as const;

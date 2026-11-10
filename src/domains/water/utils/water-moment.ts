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

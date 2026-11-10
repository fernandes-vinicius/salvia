import {
	type CheckinCelebration,
	milestoneMessage,
} from "~/domains/checkin/utils/checkin";

/** Leaves the pot can hold before the stem runs out of room. */
export const MAX_MASCOT_LEAVES = 6;

export interface MascotMoment {
	leaves: number;
	bloom: boolean;
	mood: "happy" | "party";
	title: string;
	subtitle: string;
}

const meals = (count: number) =>
	count === 1 ? "Falta 1 refeição" : `Faltam ${count} refeições`;

/**
 * What the pot shows after a meal check-in: one leaf per meal followed today,
 * blooming when the day is complete, and a line that teases the next step.
 */
export function mascotMoment({
	level,
	followed,
	mealCount,
	streak,
}: {
	level: CheckinCelebration;
	followed: number;
	mealCount: number;
	streak: number;
}): MascotMoment {
	const leaves = Math.min(Math.max(followed, 1), MAX_MASCOT_LEAVES);

	if (level === "milestone") {
		return {
			leaves,
			bloom: true,
			mood: "party",
			title: `${streak} dias seguidos!`,
			subtitle: milestoneMessage(streak),
		};
	}

	if (level === "day") {
		return {
			leaves,
			bloom: true,
			mood: "party",
			title: "Floresceu! Dia completo.",
			subtitle:
				streak > 1
					? `${streak} dias seguidos. Amanhã ela cresce de novo.`
					: "Amanhã ela cresce de novo.",
		};
	}

	const remaining = Math.max(mealCount - followed, 0);
	const title =
		followed === 1
			? "Brotou!"
			: remaining === 1
				? "Quase florindo!"
				: "Mais uma folha!";
	return {
		leaves,
		bloom: false,
		mood: "happy",
		title,
		subtitle: `${meals(remaining)} pra ela florir.`,
	};
}

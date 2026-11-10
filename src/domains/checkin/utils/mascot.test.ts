import { describe, expect, it } from "vitest";

import {
	MAX_MASCOT_LEAVES,
	mascotMoment,
} from "~/domains/checkin/utils/mascot";

describe("mascotMoment", () => {
	it("first meal of the day sprouts the plant and says how many are left", () => {
		const moment = mascotMoment({
			level: "tap",
			followed: 1,
			mealCount: 4,
			streak: 0,
		});
		expect(moment).toMatchObject({ leaves: 1, bloom: false, mood: "happy" });
		expect(moment.title).toBe("Brotou!");
		expect(moment.subtitle).toBe("Faltam 3 refeições pra ela florir.");
	});

	it("a meal in the middle of the day adds a leaf", () => {
		const moment = mascotMoment({
			level: "tap",
			followed: 2,
			mealCount: 5,
			streak: 0,
		});
		expect(moment.leaves).toBe(2);
		expect(moment.title).toBe("Mais uma folha!");
		expect(moment.subtitle).toBe("Faltam 3 refeições pra ela florir.");
	});

	it("one meal left teases the bloom in the singular", () => {
		const moment = mascotMoment({
			level: "tap",
			followed: 3,
			mealCount: 4,
			streak: 0,
		});
		expect(moment.title).toBe("Quase florindo!");
		expect(moment.subtitle).toBe("Falta 1 refeição pra ela florir.");
	});

	it("a complete day blooms and celebrates", () => {
		const moment = mascotMoment({
			level: "day",
			followed: 4,
			mealCount: 4,
			streak: 2,
		});
		expect(moment).toMatchObject({ leaves: 4, bloom: true, mood: "party" });
		expect(moment.title).toBe("Floresceu! Dia completo.");
		expect(moment.subtitle).toBe("2 dias seguidos. Amanhã ela cresce de novo.");
	});

	it("the first complete day invites to come back tomorrow", () => {
		const moment = mascotMoment({
			level: "day",
			followed: 3,
			mealCount: 3,
			streak: 1,
		});
		expect(moment.subtitle).toBe("Amanhã ela cresce de novo.");
	});

	it("a streak milestone shows the streak and its message", () => {
		const moment = mascotMoment({
			level: "milestone",
			followed: 4,
			mealCount: 4,
			streak: 7,
		});
		expect(moment).toMatchObject({ bloom: true, mood: "party" });
		expect(moment.title).toBe("7 dias seguidos!");
		expect(moment.subtitle).toBe("Uma semana inteira na dieta.");
	});

	it("caps the number of leaves the pot can show", () => {
		const moment = mascotMoment({
			level: "tap",
			followed: 9,
			mealCount: 10,
			streak: 0,
		});
		expect(moment.leaves).toBe(MAX_MASCOT_LEAVES);
	});
});

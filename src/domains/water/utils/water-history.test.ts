import { describe, expect, it } from "vitest";

import {
	MAX_DAY_ML,
	MAX_UNDO_ENTRIES,
	recordWater,
	undoWater,
} from "~/domains/water/utils/water-log";

describe("recordWater", () => {
	it("adds to the total and remembers the entry", () => {
		expect(recordWater({ ml: 500, entries: [500] }, 250)).toEqual({
			ml: 750,
			entries: [500, 250],
		});
	});

	it("remembers a removal as a negative entry", () => {
		expect(recordWater({ ml: 750, entries: [500, 250] }, -300)).toEqual({
			ml: 450,
			entries: [500, 250, -300],
		});
	});

	it("records only what was actually applied at the limits", () => {
		expect(recordWater({ ml: 200, entries: [200] }, -500)).toEqual({
			ml: 0,
			entries: [200, -200],
		});
		expect(recordWater({ ml: MAX_DAY_ML - 100, entries: [] }, 500)).toEqual({
			ml: MAX_DAY_ML,
			entries: [100],
		});
	});

	it("ignores a change that does nothing", () => {
		const state = { ml: 0, entries: [] };
		expect(recordWater(state, -250)).toBe(state);
	});

	it("keeps only the latest entries", () => {
		const entries = Array.from({ length: MAX_UNDO_ENTRIES }, () => 10);
		const next = recordWater({ ml: 10 * MAX_UNDO_ENTRIES, entries }, 250);
		expect(next.entries).toHaveLength(MAX_UNDO_ENTRIES);
		expect(next.entries.at(-1)).toBe(250);
	});
});

describe("undoWater", () => {
	it("undoes the entries from the last to the first", () => {
		let state = { ml: 1750, entries: [500, 1000, 250] };
		state = undoWater(state) ?? state;
		expect(state).toEqual({ ml: 1500, entries: [500, 1000] });
		state = undoWater(state) ?? state;
		expect(state).toEqual({ ml: 500, entries: [500] });
		state = undoWater(state) ?? state;
		expect(state).toEqual({ ml: 0, entries: [] });
		expect(undoWater(state)).toBeNull();
	});

	it("undoing a removal puts the water back", () => {
		expect(undoWater({ ml: 450, entries: [750, -300] })).toEqual({
			ml: 750,
			entries: [750],
		});
	});

	it("keeps water saved before the history existed", () => {
		// Old rows only have the total: 1 L without entries, then +250 ml.
		expect(undoWater({ ml: 1250, entries: [250] })).toEqual({
			ml: 1000,
			entries: [],
		});
	});
});

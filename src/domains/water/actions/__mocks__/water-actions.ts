// Storybook stand-in for the water Server Action (registered with `sb.mock`
// in `.storybook/preview.tsx`): the real one pulls the database into the
// browser bundle. Stories pass their own `save` when they need to.
export type WaterResult = { ok: true } | { ok: false; error: string };

export async function setTodayWaterAction(
	_data: unknown,
): Promise<WaterResult> {
	return { ok: true };
}

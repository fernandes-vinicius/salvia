// Storybook stand-in for the check-in Server Action (registered with
// `sb.mock` in `.storybook/preview.tsx`): marking works only in the story.
export type CheckinResult =
	| { ok: true }
	| { ok: false; error: string; stale?: boolean };

export async function setCheckinAction(_data: unknown): Promise<CheckinResult> {
	return { ok: true };
}

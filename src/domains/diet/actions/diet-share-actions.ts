"use server";

import { z } from "zod";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	createDietShare,
	deleteDietShare,
	findDietShare,
} from "~/domains/diet/services/diet-share-service";

/** Token do link da dieta (null = sem link). */
export async function getDietShareAction(): Promise<string | null> {
	const user = await getCurrentUser();
	return findDietShare(user.id);
}

export async function createDietShareAction(renew: unknown): Promise<string> {
	const user = await getCurrentUser();
	return createDietShare(user.id, z.boolean().catch(false).parse(renew));
}

export async function deleteDietShareAction(): Promise<null> {
	const user = await getCurrentUser();
	await deleteDietShare(user.id);
	return null;
}

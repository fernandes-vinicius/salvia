import "server-only";

import { db } from "~/shared/db";
import { userActivity } from "~/shared/db/schema";
import { localDateString } from "~/shared/lib/dates";

// Último dia gravado por usuário nesta instância: evita ir ao banco a cada
// página quando a pessoa já foi registrada hoje.
const lastRecorded = new Map<string, string>();

/** Marca que o usuário usou o app hoje (idempotente). */
export async function recordActivity(userId: string) {
	const day = localDateString();
	if (lastRecorded.get(userId) === day) return;

	await db
		.insert(userActivity)
		.values({ userId, day })
		.onConflictDoNothing()
		.catch(() => {
			// Métrica não pode derrubar a página.
		});
	lastRecorded.set(userId, day);
}

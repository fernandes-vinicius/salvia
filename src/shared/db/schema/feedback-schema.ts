import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const feedbackKindEnum = pgEnum("feedback_kind", [
	"feature",
	"problem",
	"other",
]);

// Sugestões e problemas enviados pelo app (menu do perfil). Lidos com
// `bun run feedback`; saem junto com a conta (cascade).
export const feedback = pgTable(
	"feedback",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		kind: feedbackKindEnum("kind").notNull(),
		message: text("message").notNull(),
		/** Página em que a pessoa estava ao enviar (ex.: "/dieta"). */
		page: text("page"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("feedback_user_id_idx").on(table.userId)],
);

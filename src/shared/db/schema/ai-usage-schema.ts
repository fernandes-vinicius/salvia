import { date, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Uso diário da IA por pessoa e recurso (limite contra abuso + custo real).
export const aiUsage = pgTable(
	"ai_usage",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** `AiFeature`: "recipe", "diet-import". */
		feature: text("feature").notNull(),
		day: date("day").notNull(),
		count: integer("count").notNull().default(0),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.feature, table.day] }),
	],
);

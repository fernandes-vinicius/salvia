import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Quem tocou em "Quero usar mais" com a cota do mês no fim (um pedido por
// pessoa × recurso). Mede a procura por mais IA e é a lista de quem avisar.
export const aiInterest = pgTable(
	"ai_interest",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** `AiFeature`: "recipe", "diet-import". */
		feature: text("feature").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.feature] })],
);

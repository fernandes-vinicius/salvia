import {
	date,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Resumo da semana escrito pela IA (beta), um por pessoa por semana: gerado
// uma vez e guardado, então ver de novo não chama a IA.
export const weeklySummary = pgTable(
	"weekly_summary",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Segunda-feira da semana ("YYYY-MM-DD", fuso do app). */
		weekStart: date("week_start", { mode: "string" }).notNull(),
		title: text("title").notNull(),
		text: text("text").notNull(),
		nextStep: text("next_step").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.weekStart] })],
);

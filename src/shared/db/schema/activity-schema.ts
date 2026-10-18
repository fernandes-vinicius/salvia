import { date, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Dias em que cada pessoa abriu o app (uma linha por dia, horário de
// Brasília). Base das métricas de funil e retenção (`bun run metrics`);
// nada de conteúdo, só "esteve aqui nesse dia".
export const userActivity = pgTable(
	"user_activity",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		day: date("day").notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.day] })],
);

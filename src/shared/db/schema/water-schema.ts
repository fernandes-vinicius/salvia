import { sql } from "drizzle-orm";
import {
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Água do dia (Início): o total bebido por pessoa por dia e o recomendado que
// valia naquele dia (a meta antiga não muda se o peso ou o treino mudarem).
export const waterLog = pgTable(
	"water_log",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Dia no fuso do app (`localDateString`). */
		day: date("day").notNull(),
		ml: integer("ml").notNull(),
		targetMl: integer("target_ml").notNull(),
		/** Changes of the day in order (+ added, − removed), for undo. */
		entries: integer("entries").array().notNull().default(sql`'{}'::integer[]`),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("water_log_user_day_idx").on(table.userId, table.day),
	],
);

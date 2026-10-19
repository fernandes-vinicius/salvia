import {
	date,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";
import { dietMeal } from "~/shared/db/schema/diet-schema";

export const checkinStatusEnum = pgEnum("checkin_status", [
	"done",
	"option",
	"skipped",
]);

// Check-in do dia ("segui a dieta?"): uma marcação por refeição por dia.
// Guarda o nome da refeição: o histórico continua se ela for apagada (ou a
// dieta resetada), só perde o vínculo (`meal_id` vira nulo).
export const mealCheckin = pgTable(
	"meal_checkin",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mealId: uuid("meal_id").references(() => dietMeal.id, {
			onDelete: "set null",
		}),
		mealName: text("meal_name").notNull(),
		/** Dia no fuso do app (`localDateString`). */
		day: date("day").notNull(),
		status: checkinStatusEnum("status").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("meal_checkin_user_day_idx").on(table.userId, table.day),
		uniqueIndex("meal_checkin_meal_day_idx").on(table.mealId, table.day),
	],
);

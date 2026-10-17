import {
	doublePrecision,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";
import { food } from "~/shared/db/schema/food-schema";

// Plano de dieta (um por usuário): refeições ordenadas com seus alimentos.
export const dietMeal = pgTable(
	"diet_meal",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		/** "HH:MM" ou nulo. */
		time: text("time"),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("diet_meal_user_id_idx").on(table.userId)],
);

export const dietItem = pgTable(
	"diet_item",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		mealId: uuid("meal_id")
			.notNull()
			.references(() => dietMeal.id, { onDelete: "cascade" }),
		foodId: uuid("food_id")
			.notNull()
			.references(() => food.id, { onDelete: "cascade" }),
		/** Em g/ml ou unidades, conforme `food.unit`. */
		quantity: doublePrecision("quantity").notNull(),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("diet_item_meal_id_idx").on(table.mealId)],
);

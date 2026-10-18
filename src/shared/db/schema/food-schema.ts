import {
	doublePrecision,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const foodSourceEnum = pgEnum("food_source", ["taco", "custom"]);
export const foodUnitEnum = pgEnum("food_unit", ["g", "ml", "unit"]);
export const proteinSourceEnum = pgEnum("protein_source", [
	"animal",
	"vegetal",
]);

// Alimentos: base TACO (global, `userId` nulo) + cadastrados pelo usuário.
// Macros por 100 g/ml (`unit` g/ml) ou por 1 unidade (`unit` = unit).
export const food = pgTable(
	"food",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		source: foodSourceEnum("source").notNull(),
		tacoId: integer("taco_id").unique(),
		name: text("name").notNull(),
		/** Nome em minúsculas e sem acento, pra busca tolerante. */
		searchName: text("search_name").notNull(),
		category: text("category"),
		unit: foodUnitEnum("unit").notNull(),
		protein: doublePrecision("protein").notNull(),
		carbs: doublePrecision("carbs").notNull(),
		fat: doublePrecision("fat").notNull(),
		/** Fibra alimentar, na mesma base dos macros (não entra nas kcal). */
		fiber: doublePrecision("fiber").notNull().default(0),
		proteinSource: proteinSourceEnum("protein_source").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("food_user_id_idx").on(table.userId)],
);

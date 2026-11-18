import {
	type AnyPgColumn,
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
		/**
		 * `active` (a dieta que vale), `draft` (rascunho pra experimentar) ou
		 * `previous` (a guardada ao usar um rascunho, pra voltar).
		 */
		variant: text("variant", { enum: ["active", "draft", "previous"] })
			.notNull()
			.default("active"),
		/** No rascunho/anterior: a refeição da dieta de onde a cópia veio. */
		sourceMealId: uuid("source_meal_id").references(
			(): AnyPgColumn => dietMeal.id,
			{ onDelete: "set null" },
		),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("diet_meal_user_id_idx").on(table.userId),
		index("diet_meal_user_variant_idx").on(table.userId, table.variant),
	],
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

// Opções de um item ("200 g de mamão ou 1 banana"): alternativas que a
// pessoa pode comer no lugar. Não entram nos totais (quem conta é o item).
export const dietItemOption = pgTable(
	"diet_item_option",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		itemId: uuid("item_id")
			.notNull()
			.references(() => dietItem.id, { onDelete: "cascade" }),
		foodId: uuid("food_id")
			.notNull()
			.references(() => food.id, { onDelete: "cascade" }),
		/** Em g/ml ou unidades, conforme `food.unit`. */
		quantity: doublePrecision("quantity").notNull(),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("diet_item_option_item_id_idx").on(table.itemId)],
);

// Link público só de leitura da dieta (`/d/:token`), um por pessoa. Apagar a
// linha desativa o link; um token novo invalida o anterior.
export const dietShare = pgTable("diet_share", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

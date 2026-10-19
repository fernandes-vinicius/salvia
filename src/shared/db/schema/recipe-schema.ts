import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import type { Macros } from "~/domains/food/types/food-types";
import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import type { RecipePhoto } from "~/domains/meal-recipe/utils/recipe-photo";
import type { RecipeIngredient } from "~/domains/meal-recipe/utils/saved-recipe";
import { user } from "~/shared/db/schema/auth-schema";
import { dietMeal } from "~/shared/db/schema/diet-schema";

// Receitas geradas pela IA que a pessoa salvou ("Minhas receitas"). Guardam
// a foto da refeição (ingredientes e macros) do momento em que foram salvas.
export const savedRecipe = pgTable(
	"saved_recipe",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Refeição de origem; nulo se ela for apagada (a receita fica). */
		mealId: uuid("meal_id").references(() => dietMeal.id, {
			onDelete: "set null",
		}),
		mealName: text("meal_name").notNull(),
		title: text("title").notNull(),
		summary: text("summary").notNull(),
		minutes: integer("minutes").notNull(),
		extras: jsonb("extras").$type<MealRecipe["extras"]>().notNull(),
		steps: jsonb("steps").$type<string[]>().notNull(),
		tip: text("tip"),
		ingredients: jsonb("ingredients").$type<RecipeIngredient[]>().notNull(),
		macros: jsonb("macros").$type<Macros>().notNull(),
		/** Foto ilustrativa do Unsplash (só URL e crédito, nada da imagem). */
		photo: jsonb("photo").$type<RecipePhoto>(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("saved_recipe_user_id_idx").on(table.userId)],
);

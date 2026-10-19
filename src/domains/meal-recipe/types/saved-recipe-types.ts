import type { Macros } from "~/domains/food/types/food-types";
import type { MealRecipe } from "~/domains/meal-recipe/schemas/meal-recipe-schema";
import type { RecipeIngredient } from "~/domains/meal-recipe/utils/saved-recipe";

export interface SavedRecipe extends MealRecipe {
	id: string;
	mealId: string | null;
	mealName: string;
	ingredients: RecipeIngredient[];
	macros: Macros;
	/** ISO. */
	createdAt: string;
}

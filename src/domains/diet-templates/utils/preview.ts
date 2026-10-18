import { DIET_TEMPLATES } from "~/domains/diet-templates/data/templates";
import type { DietTemplatePreview } from "~/domains/diet-templates/types/diet-template-preview";
import {
	type MacroGoal,
	personalizeTemplate,
} from "~/domains/diet-templates/utils/personalize";
import {
	resolveTemplate,
	type TemplateFoods,
} from "~/domains/diet-templates/utils/resolve";
import { kcalFor, macrosFor, sumMacros } from "~/domains/food/utils/food";

/** Prévia de cada modelo com as quantidades que a pessoa receberia. */
export function previewTemplates(
	foods: TemplateFoods,
	goal: MacroGoal | null,
): DietTemplatePreview[] {
	return DIET_TEMPLATES.map((template) => {
		const meals = personalizeTemplate(resolveTemplate(template, foods), goal);
		const macros = sumMacros(
			meals.flatMap((meal) =>
				meal.items.map((item) => macrosFor(item.food, item.quantity)),
			),
		);
		return {
			id: template.id,
			name: template.name,
			tag: template.tag,
			description: template.description,
			mealCount: meals.length,
			meals: meals.map((meal, mealIndex) => ({
				id: `${template.id}-${mealIndex}`,
				name: meal.name,
				time: meal.time,
				items: meal.items.map((item, itemIndex) => ({
					id: `${template.id}-${mealIndex}-${itemIndex}`,
					food: item.food,
					quantity: item.quantity,
				})),
			})),
			kcal: kcalFor(macros),
			macros,
			personalized: goal !== null,
		};
	});
}

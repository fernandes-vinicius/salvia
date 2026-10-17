// Só exports seguros pro client. Server-only (food-service) é importado pelo
// caminho direto.
export { CustomFoodForm } from "~/domains/food/components/custom-food-form";
export { FoodSearch } from "~/domains/food/components/food-search";
export { MacroLine } from "~/domains/food/components/macro-line";
export { MyFoods } from "~/domains/food/components/my-foods";
export {
	defaultQuantityFor,
	QuantityEditor,
} from "~/domains/food/components/quantity-editor";
export type {
	CustomFoodSummary,
	Food,
	FoodUnit,
	Macros,
	ProteinSource,
} from "~/domains/food/types/food-types";
export {
	kcalFor,
	macrosFor,
	sumMacros,
	UNIT_LABELS,
} from "~/domains/food/utils/food";

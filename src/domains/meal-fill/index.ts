// Só exports seguros pro client. Server-only (meal-fill-service) é importado
// pelo caminho direto.
export { MealFillSheet } from "~/domains/meal-fill/components/meal-fill-sheet";
export type { MealFill } from "~/domains/meal-fill/schemas/meal-fill-schema";

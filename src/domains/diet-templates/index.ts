// Só exports seguros pro client. Server-only (diet-template-service) é
// importado pelo caminho direto.
export { DietTemplates } from "~/domains/diet-templates/components/diet-templates";
export type { DietTemplatePreview } from "~/domains/diet-templates/types/diet-template-preview";
export { previewTemplates } from "~/domains/diet-templates/utils/preview";

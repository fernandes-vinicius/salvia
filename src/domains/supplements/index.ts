// Só exports seguros pro client. Server-only (supplement-service) é importado
// pelo caminho direto.
export { SupplementsCard } from "~/domains/supplements/components/supplements-card";
export { SupplementsPreview } from "~/domains/supplements/components/supplements-preview";
export type { Supplement } from "~/domains/supplements/types/supplement-types";

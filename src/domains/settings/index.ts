// Só exports seguros pro client. Server-only (settings-service) é importado
// pelo caminho direto.
export { SettingsForm } from "~/domains/settings/components/settings-form";
export type { UserSettings } from "~/domains/settings/types/settings-types";

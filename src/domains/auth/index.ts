// Só exports seguros pro client. Server-only (auth, getCurrentUser) são
// importados pelo caminho direto: `~/domains/auth/lib/auth` e
// `~/domains/auth/services/session-service`.
export { GoogleSignInButton } from "~/domains/auth/components/google-sign-in-button";
export { LoginErrorAlert } from "~/domains/auth/components/login-error-alert";
export { RedirectIfAuthenticated } from "~/domains/auth/components/redirect-if-authenticated";
export { UserMenu } from "~/domains/auth/components/user-menu";
export type { User } from "~/domains/auth/types/user-types";

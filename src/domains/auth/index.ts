// Só exports seguros pro client. Server-only (auth, getCurrentUser) são
// importados pelo caminho direto: `~/domains/auth/lib/auth` e
// `~/domains/auth/services/session-service`.
export { AuthCard, AuthFooterLink } from "~/domains/auth/components/auth-card";
export { DeleteAccount } from "~/domains/auth/components/delete-account";
export { EmailSignInForm } from "~/domains/auth/components/email-sign-in-form";
export { ForgotPasswordForm } from "~/domains/auth/components/forgot-password-form";
export { GoogleSignInButton } from "~/domains/auth/components/google-sign-in-button";
export { LoginErrorAlert } from "~/domains/auth/components/login-error-alert";
export { RedirectIfAuthenticated } from "~/domains/auth/components/redirect-if-authenticated";
export { ResetPasswordForm } from "~/domains/auth/components/reset-password-form";
export { SignUpForm } from "~/domains/auth/components/sign-up-form";
export { TermsNotice } from "~/domains/auth/components/terms-notice";
export { UserMenu } from "~/domains/auth/components/user-menu";
export type { User } from "~/domains/auth/types/user-types";

import { isAiOpen } from "~/shared/lib/beta";

/**
 * IA aberta pra todos (`AI_OPEN`), pros textos públicos (landing, FAQ,
 * Termos, Privacidade). Lido no servidor; as páginas estáticas guardam o
 * valor do deploy, então mudar a variável na Vercel pede um novo deploy.
 */
export const AI_IS_OPEN = isAiOpen(process.env.AI_OPEN);

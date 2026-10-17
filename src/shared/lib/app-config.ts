export const APP_NAME = "Sálvia";
export const APP_TAGLINE = "Dieta e Nutrição";

/** Descrição curta usada em metadados (busca, compartilhamento, manifest). */
export const APP_DESCRIPTION =
	"Calcule seu gasto calórico, defina a meta em g/kg e monte a dieta batendo proteína, carboidrato e gordura, com a tabela TACO. Grátis.";

/**
 * URL pública do site (canonical, Open Graph, sitemap). Em outro domínio,
 * defina `NEXT_PUBLIC_SITE_URL`.
 */
export const SITE_URL = new URL(
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://salvia-dieta.vercel.app",
);

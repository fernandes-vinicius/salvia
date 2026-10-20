import { z } from "zod";

// Manchetes do blog Hipertrofia.org (API pública do WordPress). Pelos termos
// de uso deles, só título, data, uma linha de resumo e o link pro artigo no
// site deles: nunca o texto completo nem as imagens (sem autorização escrita),
// nunca atrás do plano pago e sem sugerir parceria.

export const NEWS_SOURCE = {
	name: "Hipertrofia.org",
	url: "https://www.hipertrofia.org/blog/",
	api: "https://www.hipertrofia.org/blog/wp-json/wp/v2/posts",
	// Só o assunto do app: Nutrição, Suplementação e Creatina. Fora Recursos
	// ergogênicos (anabolizantes) e Fisiculturismo. Ids das categorias do
	// WordPress deles (`/wp-json/wp/v2/categories`).
	categories: [5, 4, 1288],
	excludeCategories: [3, 1229],
} as const;

export interface NewsItem {
	id: number;
	title: string;
	excerpt: string;
	/** ISO em UTC. */
	publishedAt: string;
	/** Link pro artigo no site deles, com UTM. */
	url: string;
}

const MAX_EXCERPT = 140;

const NAMED: Record<string, string> = {
	amp: "&",
	quot: '"',
	apos: "'",
	lt: "<",
	gt: ">",
	nbsp: " ",
	hellip: "…",
	ndash: "–",
	mdash: "—",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
};

/** Entidades HTML que o WordPress manda no título/resumo (`&#8211;`, `&amp;`). */
export function decodeEntities(text: string) {
	return text.replace(
		/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
		(match, code: string) => {
			if (code[0] === "#") {
				const value =
					code[1] === "x" || code[1] === "X"
						? Number.parseInt(code.slice(2), 16)
						: Number(code.slice(1));
				return Number.isFinite(value) ? String.fromCodePoint(value) : match;
			}
			return NAMED[code.toLowerCase()] ?? match;
		},
	);
}

const plainText = (html: string) =>
	decodeEntities(html.replace(/<[^>]*>/g, " "))
		// "[…]" e "Continue lendo" do fim do resumo do WordPress.
		.replace(/\[…\]|\[\.\.\.\]|continue lendo.*$/gi, "")
		.replace(/\s+/g, " ")
		.trim();

function shorten(text: string, max: number) {
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:–-]+$/, "")}…`;
}

export function withNewsUtm(link: string) {
	const url = new URL(link);
	url.searchParams.set("utm_source", "salvia");
	url.searchParams.set("utm_medium", "app");
	url.searchParams.set("utm_campaign", "manchetes");
	return url.toString();
}

const wpPostSchema = z.object({
	id: z.number(),
	date_gmt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
	link: z.string().startsWith(NEWS_SOURCE.url),
	title: z.object({ rendered: z.string().min(1) }),
	excerpt: z.object({ rendered: z.string() }),
});

/** Posts da API do WordPress → manchetes limpas (ignora o que vier quebrado). */
export function newsFromWordPress(data: unknown): NewsItem[] {
	if (!Array.isArray(data)) return [];
	return data.flatMap((entry) => {
		const parsed = wpPostSchema.safeParse(entry);
		if (!parsed.success) return [];
		const post = parsed.data;
		return [
			{
				id: post.id,
				title: plainText(post.title.rendered),
				excerpt: shorten(plainText(post.excerpt.rendered), MAX_EXCERPT),
				publishedAt: `${post.date_gmt}Z`,
				url: withNewsUtm(post.link),
			},
		];
	});
}

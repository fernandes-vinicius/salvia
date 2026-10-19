// Foto ilustrativa da receita, do Unsplash. A imagem é carregada direto do
// Unsplash (nada guardado no app; a receita salva guarda só a URL e o
// crédito), como pedem as regras da API: crédito com links e `utm_*`.

export interface RecipePhoto {
	url: string;
	alt: string;
	authorName: string;
	authorUrl: string;
	photoUrl: string;
	/** Avisar o Unsplash quando a foto é usada (ao salvar a receita). */
	downloadLocation: string;
}

/** Resultado da busca `/search/photos` (só o que usamos). */
export interface UnsplashResult {
	alt_description: string | null;
	urls: { raw: string };
	links: { html: string; download_location: string };
	user: { name: string; links: { html: string } };
}

const UTM = "utm_source=salvia&utm_medium=referral";

export function withUnsplashUtm(url: string) {
	return `${url}${url.includes("?") ? "&" : "?"}${UTM}`;
}

/** 960×540 recortada, qualidade 70, formato automático (WebP/AVIF). */
export function photoFromUnsplash(result: UnsplashResult): RecipePhoto {
	return {
		url: `${result.urls.raw}&w=960&h=540&fit=crop&q=70&auto=format`,
		alt: result.alt_description ?? "",
		authorName: result.user.name,
		authorUrl: withUnsplashUtm(result.user.links.html),
		photoUrl: withUnsplashUtm(result.links.html),
		downloadLocation: result.links.download_location,
	};
}

export function isUnsplashImage(url: string) {
	return url.startsWith("https://images.unsplash.com/");
}

const STOPWORDS = new Set(["a", "an", "and", "in", "of", "on", "the", "with"]);

const words = (text: string) =>
	text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word && !STOPWORDS.has(word))
		.map((word) => (word.length > 3 ? word.replace(/s$/, "") : word));

/**
 * Entre os resultados da busca, a foto cuja descrição tem mais palavras do
 * termo; precisa bater pelo menos metade delas (foto errada é pior que
 * nenhuma). Empate fica com a primeira (mais relevante pro Unsplash).
 */
export function pickPhoto<T extends Pick<UnsplashResult, "alt_description">>(
	results: T[],
	query: string,
): T | null {
	const wanted = [...new Set(words(query))];
	const needed = Math.max(1, Math.ceil(wanted.length / 2));
	let best: { result: T; score: number } | null = null;
	for (const result of results) {
		const found = new Set(words(result.alt_description ?? ""));
		const score = wanted.filter((word) => found.has(word)).length;
		if (score >= needed && (!best || score > best.score)) {
			best = { result, score };
		}
	}
	return best?.result ?? null;
}

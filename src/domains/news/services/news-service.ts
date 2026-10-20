import "server-only";

import { cacheLife } from "next/cache";

import {
	NEWS_SOURCE,
	type NewsItem,
	newsFromWordPress,
} from "~/domains/news/utils/news";
import { SITE_URL } from "~/shared/lib/app-config";

/**
 * Últimas manchetes do Hipertrofia.org. Cache compartilhado de horas: uma
 * leitura pra todo mundo, sem pesar no site deles. Falhou? Lista vazia (o
 * card some).
 */
export async function getLatestNews(limit = 4): Promise<NewsItem[]> {
	"use cache";
	cacheLife("hours");

	const url = new URL(NEWS_SOURCE.api);
	url.searchParams.set("per_page", String(limit));
	url.searchParams.set("categories", NEWS_SOURCE.categories.join(","));
	url.searchParams.set(
		"categories_exclude",
		NEWS_SOURCE.excludeCategories.join(","),
	);
	url.searchParams.set("_fields", "id,date_gmt,link,title,excerpt");
	try {
		const response = await fetch(url, {
			headers: { "User-Agent": `Salvia (+${SITE_URL.href})` },
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return [];
		return newsFromWordPress(await response.json()).slice(0, limit);
	} catch (error) {
		console.error("[news] falha ao ler as manchetes", error);
		return [];
	}
}

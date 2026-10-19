import "server-only";

import {
	photoFromUnsplash,
	pickPhoto,
	type RecipePhoto,
	type UnsplashResult,
} from "~/domains/meal-recipe/utils/recipe-photo";
import { getEnv } from "~/shared/lib/env";

const API = "https://api.unsplash.com";

const headers = (key: string) => ({
	Authorization: `Client-ID ${key}`,
	"Accept-Version": "v1",
});

/**
 * Uma foto de comida pro termo (em inglês, vem da IA): busca 10 e fica com a
 * que combina (`pickPhoto`). Null sem chave, sem foto que combine ou se o
 * Unsplash falhar: a receita aparece sem foto.
 */
export async function findRecipePhoto(
	query: string,
): Promise<RecipePhoto | null> {
	const key = getEnv().UNSPLASH_ACCESS_KEY;
	if (!key || !query.trim()) return null;
	const params = new URLSearchParams({
		query,
		per_page: "10",
		orientation: "landscape",
		content_filter: "high",
	});
	try {
		const response = await fetch(`${API}/search/photos?${params}`, {
			headers: headers(key),
			signal: AbortSignal.timeout(4000),
		});
		if (!response.ok) return null;
		const data = (await response.json()) as { results: UnsplashResult[] };
		const picked = pickPhoto(data.results, query);
		return picked ? photoFromUnsplash(picked) : null;
	} catch {
		return null;
	}
}

/** Avisa o Unsplash que a foto foi usada (regra da API), ao salvar a receita. */
export async function trackPhotoDownload(photo: RecipePhoto) {
	const key = getEnv().UNSPLASH_ACCESS_KEY;
	if (!key || !photo.downloadLocation.startsWith(`${API}/`)) return;
	await fetch(photo.downloadLocation, {
		headers: headers(key),
		signal: AbortSignal.timeout(4000),
	}).catch(() => undefined);
}

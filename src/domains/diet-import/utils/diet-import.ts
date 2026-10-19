import type { FoodUnit } from "~/domains/food/types/food-types";
import {
	normalizeSearchText,
	quantityRangeFor,
} from "~/domains/food/utils/food";

// Regras puras da importação de dieta (PDF/foto do nutri lidos pela IA).

export const ACCEPTED_UPLOAD_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/heic",
	"image/heif",
	"application/pdf",
];
export const MAX_UPLOAD_FILES = 4;
/** Abaixo do limite das Server Actions (4 MB em `next.config.ts`). */
export const MAX_UPLOAD_BYTES = 3_500_000;

/** Mensagem de erro do envio, ou null se está tudo certo. */
export function checkUploads(files: { type: string; size: number }[]) {
	if (files.length === 0) return "Envie ao menos uma foto ou PDF da dieta.";
	if (files.length > MAX_UPLOAD_FILES) {
		return `Envie até ${MAX_UPLOAD_FILES} arquivos por vez.`;
	}
	if (files.some((file) => !ACCEPTED_UPLOAD_TYPES.includes(file.type))) {
		return "Formato não suportado: use foto ou PDF.";
	}
	const total = files.reduce((sum, file) => sum + file.size, 0);
	if (total > MAX_UPLOAD_BYTES) {
		return "Os arquivos passam de 3,5 MB juntos. Tente menos páginas ou fotos menores.";
	}
	return null;
}

const STOPWORDS = new Set([
	"a",
	"o",
	"e",
	"de",
	"da",
	"do",
	"das",
	"dos",
	"em",
]);

/**
 * Buscas na base de alimentos, da mais específica pra mais genérica:
 * "Frango peito grelhado" → "frango peito grelhado", "frango peito", "frango".
 */
export function searchQueriesFor(name: string) {
	const words = [
		...new Set(
			normalizeSearchText(name)
				.split(" ")
				.filter((word) => word && !STOPWORDS.has(word)),
		),
	];
	return words.map((_, index) =>
		words.slice(0, words.length - index).join(" "),
	);
}

export interface ReadAmount {
	/** Peso (ou volume) estimado pela IA, em g/ml. */
	grams: number | null;
	/** Contagem, quando o item é contável ("2 ovos"). */
	units: number | null;
}

/**
 * Quantidade no formato do alimento casado: contagem pra quem é por unidade,
 * peso pra quem é por 100 g/ml. Arredonda no passo do editor e respeita os
 * limites dele; sem o dado, usa o padrão (1 unidade, 100 g).
 */
export function importedQuantity(unit: FoodUnit, read: ReadAmount) {
	const range = quantityRangeFor(unit);
	const value = unit === "unit" ? read.units : read.grams;
	if (value === null || !Number.isFinite(value) || value <= 0) {
		return unit === "unit" ? 1 : 100;
	}
	const rounded = Math.round(value / range.step) * range.step;
	return Math.min(range.max, Math.max(range.min, rounded));
}

/** "7h30", "7:30", "12h" → "07:30"/"12:00"; inválido ou ausente → null. */
export function mealTime(text: string | null) {
	const match = text?.trim().match(/^(\d{1,2})\s*[:h]\s*(\d{2})?$/i);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2] ?? 0);
	if (hours > 23 || minutes > 59) return null;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Palavras comparáveis: sem acento, sem ligação e sem o "s" do plural. */
function matchWords(text: string) {
	return normalizeSearchText(text)
		.split(/[^a-z0-9]+/)
		.filter((word) => word && !STOPWORDS.has(word))
		.map((word) => (word.length > 3 ? word.replace(/s$/, "") : word));
}

/**
 * Entre os resultados da busca, o que tem mais palavras em comum com o nome
 * lido ("arroz branco cozido" → "Arroz, tipo 1, cozido", não "Arroz
 * carreteiro"); empate fica com o primeiro (a busca já ordena). Null se
 * nenhum tiver palavra em comum.
 */
export function bestMatch<T extends { name: string }>(
	name: string,
	candidates: T[],
): T | null {
	const wanted = new Set(matchWords(name));
	let best: { candidate: T; score: number } | null = null;
	for (const candidate of candidates) {
		const words = new Set(matchWords(candidate.name));
		const score = [...wanted].filter((word) => words.has(word)).length;
		if (score > 0 && (!best || score > best.score)) best = { candidate, score };
	}
	return best?.candidate ?? null;
}

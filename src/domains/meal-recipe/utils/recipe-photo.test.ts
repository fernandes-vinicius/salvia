import { describe, expect, it } from "vitest";

import {
	isUnsplashImage,
	photoFromUnsplash,
	pickPhoto,
	withUnsplashUtm,
} from "~/domains/meal-recipe/utils/recipe-photo";

const result = {
	alt_description: "pancakes with banana slices",
	urls: { raw: "https://images.unsplash.com/photo-123?ixid=abc" },
	links: {
		html: "https://unsplash.com/photos/xyz",
		download_location: "https://api.unsplash.com/photos/xyz/download?ixid=abc",
	},
	user: {
		name: "Ana Souza",
		links: { html: "https://unsplash.com/@ana" },
	},
};

describe("withUnsplashUtm", () => {
	it("acrescenta a origem exigida pelo Unsplash nos links de crédito", () => {
		expect(withUnsplashUtm("https://unsplash.com/@ana")).toBe(
			"https://unsplash.com/@ana?utm_source=salvia&utm_medium=referral",
		);
		expect(withUnsplashUtm("https://unsplash.com/?a=1")).toBe(
			"https://unsplash.com/?a=1&utm_source=salvia&utm_medium=referral",
		);
	});
});

describe("photoFromUnsplash", () => {
	it("monta a foto com tamanho leve, crédito e link de download", () => {
		expect(photoFromUnsplash(result)).toEqual({
			url: "https://images.unsplash.com/photo-123?ixid=abc&w=960&h=540&fit=crop&q=70&auto=format",
			alt: "pancakes with banana slices",
			authorName: "Ana Souza",
			authorUrl:
				"https://unsplash.com/@ana?utm_source=salvia&utm_medium=referral",
			photoUrl:
				"https://unsplash.com/photos/xyz?utm_source=salvia&utm_medium=referral",
			downloadLocation: "https://api.unsplash.com/photos/xyz/download?ixid=abc",
		});
	});

	it("sem descrição usa texto vazio", () => {
		expect(photoFromUnsplash({ ...result, alt_description: null }).alt).toBe(
			"",
		);
	});
});

describe("isUnsplashImage", () => {
	it("aceita só imagens servidas pelo Unsplash", () => {
		expect(isUnsplashImage("https://images.unsplash.com/photo-1?w=9")).toBe(
			true,
		);
		expect(isUnsplashImage("https://evil.com/images.unsplash.com/x")).toBe(
			false,
		);
		expect(isUnsplashImage("http://images.unsplash.com/x")).toBe(false);
	});
});

describe("pickPhoto", () => {
	const photo = (alt: string | null) => ({ ...result, alt_description: alt });

	it("escolhe a foto cuja descrição tem mais palavras da busca", () => {
		const picked = pickPhoto(
			[
				photo("yellow rice on white ceramic plate"),
				photo("scrambled eggs on toast"),
				photo("toast with butter"),
			],
			"scrambled eggs toast",
		);
		expect(picked?.alt_description).toBe("scrambled eggs on toast");
	});

	it("ignora plural e maiúsculas", () => {
		const picked = pickPhoto(
			[photo("Banana Pancakes stack")],
			"banana pancake",
		);
		expect(picked?.alt_description).toBe("Banana Pancakes stack");
	});

	it("exige ao menos metade das palavras (senão, sem foto)", () => {
		expect(
			pickPhoto([photo("yellow rice")], "scrambled eggs toast"),
		).toBeNull();
		expect(
			pickPhoto([photo("eggs in a basket")], "scrambled eggs toast"),
		).toBeNull();
		expect(pickPhoto([photo(null)], "eggs")).toBeNull();
	});

	it("empate fica com a mais relevante da busca (a primeira)", () => {
		const picked = pickPhoto(
			[photo("chicken bowl one"), photo("chicken bowl two")],
			"chicken bowl",
		);
		expect(picked?.alt_description).toBe("chicken bowl one");
	});
});

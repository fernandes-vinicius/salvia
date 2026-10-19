import { describe, expect, it } from "vitest";

import {
	recipeShareMessage,
	recipeShareUrl,
	whatsappShareUrl,
} from "~/domains/meal-recipe/utils/recipe-share";

describe("recipeShareUrl", () => {
	it("monta o link público da receita", () => {
		expect(recipeShareUrl("https://salvia.app", "abc123")).toBe(
			"https://salvia.app/r/abc123",
		);
		expect(recipeShareUrl("https://salvia.app/", "abc123")).toBe(
			"https://salvia.app/r/abc123",
		);
	});
});

describe("recipeShareMessage", () => {
	it("convida com o título, o tempo e o link", () => {
		expect(
			recipeShareMessage(
				{ title: "Panqueca de banana", minutes: 10 },
				"https://salvia.app/r/abc",
			),
		).toBe(
			"Olha essa receita que eu fiz com o que já estava na minha dieta: *Panqueca de banana* (10 min)\nhttps://salvia.app/r/abc",
		);
	});
});

describe("whatsappShareUrl", () => {
	it("abre o WhatsApp com a mensagem pronta", () => {
		expect(whatsappShareUrl("Oi *você*\nhttps://x.y/r/1")).toBe(
			"https://wa.me/?text=Oi%20*voc%C3%AA*%0Ahttps%3A%2F%2Fx.y%2Fr%2F1",
		);
	});
});

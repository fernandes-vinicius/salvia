import { describe, expect, it } from "vitest";

import {
	decodeEntities,
	newsFromWordPress,
	withNewsUtm,
} from "~/domains/news/utils/news";

const post = (overrides: Record<string, unknown> = {}) => ({
	id: 1,
	date_gmt: "2026-10-14T10:39:45",
	link: "https://www.hipertrofia.org/blog/suplementos-para-usar-nos-dias-de-descanso/",
	title: { rendered: "4 suplementos para os dias de descanso &#8211; guia" },
	excerpt: {
		rendered:
			"<p>Nos dias sem treino o corpo se recupera &amp; cresce. Veja o que ajuda [&hellip;]</p>\n",
	},
	...overrides,
});

describe("decodeEntities", () => {
	it("decodifica entidades numéricas e nomeadas comuns", () => {
		expect(
			decodeEntities("A &#8211; B &amp; C &#x201C;D&#x201D; &nbsp;E&hellip;"),
		).toBe("A – B & C “D”  E…");
	});
});

describe("newsFromWordPress", () => {
	it("converte os posts da API do WordPress em manchetes limpas", () => {
		expect(newsFromWordPress([post()])).toEqual([
			{
				id: 1,
				title: "4 suplementos para os dias de descanso – guia",
				excerpt:
					"Nos dias sem treino o corpo se recupera & cresce. Veja o que ajuda",
				publishedAt: "2026-10-14T10:39:45Z",
				url: "https://www.hipertrofia.org/blog/suplementos-para-usar-nos-dias-de-descanso/?utm_source=salvia&utm_medium=app&utm_campaign=manchetes",
			},
		]);
	});

	it("corta o resumo longo na palavra, com reticências", () => {
		const long = `<p>${"palavra ".repeat(40)}</p>`;
		const [item] = newsFromWordPress([post({ excerpt: { rendered: long } })]);
		expect(item.excerpt.length).toBeLessThanOrEqual(141);
		expect(item.excerpt.endsWith("palavra…")).toBe(true);
	});

	it("ignora posts quebrados e links de fora do blog", () => {
		expect(
			newsFromWordPress([
				post({ id: 2, link: "https://outro-site.com/post" }),
				{ id: 3 },
				"lixo",
				post({ id: 4 }),
			]).map((item) => item.id),
		).toEqual([4]);
	});

	it("resposta que não é lista vira lista vazia", () => {
		expect(newsFromWordPress({ code: "rest_error" })).toEqual([]);
	});
});

describe("withNewsUtm", () => {
	it("mantém a query que já existe", () => {
		expect(withNewsUtm("https://www.hipertrofia.org/blog/x/?a=1")).toBe(
			"https://www.hipertrofia.org/blog/x/?a=1&utm_source=salvia&utm_medium=app&utm_campaign=manchetes",
		);
	});
});

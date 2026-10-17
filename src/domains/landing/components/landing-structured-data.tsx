import { FAQ_QUESTIONS } from "~/domains/landing/components/landing-faq";
import {
	APP_DESCRIPTION,
	APP_NAME,
	APP_TAGLINE,
	SITE_URL,
} from "~/shared/lib/app-config";

// Dados estruturados (schema.org) da landing: o app e as dúvidas frequentes.
// Ajudam a busca a entender a página e podem gerar resultados enriquecidos.
const STRUCTURED_DATA = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebApplication",
			name: `${APP_NAME} · ${APP_TAGLINE}`,
			url: SITE_URL.href,
			description: APP_DESCRIPTION,
			applicationCategory: "HealthApplication",
			operatingSystem: "Web",
			inLanguage: "pt-BR",
			isAccessibleForFree: true,
			offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
		},
		{
			"@type": "FAQPage",
			mainEntity: FAQ_QUESTIONS.map(({ question, answer }) => ({
				"@type": "Question",
				name: question,
				acceptedAnswer: { "@type": "Answer", text: answer },
			})),
		},
	],
};

export function LandingStructuredData() {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático do próprio código, com `<` escapado
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
			}}
		/>
	);
}

import { FAQ_QUESTIONS } from "~/domains/landing/components/landing-faq";
import { faqStructuredData } from "~/shared/components/faq-list";
import { StructuredData } from "~/shared/components/structured-data";
import {
	APP_DESCRIPTION,
	APP_NAME,
	APP_TAGLINE,
	SITE_URL,
} from "~/shared/lib/app-config";

// Dados estruturados (schema.org) da landing: o app e as dúvidas frequentes.
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
		faqStructuredData(FAQ_QUESTIONS),
	],
};

export function LandingStructuredData() {
	return <StructuredData data={STRUCTURED_DATA} />;
}

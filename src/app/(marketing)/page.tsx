import type { Metadata } from "next";
import {
	LandingFaq,
	LandingFeatures,
	LandingFinalCta,
	LandingHero,
	LandingHowItWorks,
	LandingPainPoints,
	LandingStructuredData,
} from "~/domains/landing";
import { LandingCalculators } from "~/domains/landing/components/landing-calculators";
import { APP_DESCRIPTION, APP_NAME } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: {
		absolute: `${APP_NAME} · Sua dieta em ordem, com os macros batendo`,
	},
	description: APP_DESCRIPTION,
	alternates: { canonical: "/" },
};

export default function LandingPage() {
	return (
		<main className="flex flex-col">
			<LandingHero />
			<LandingPainPoints />
			<LandingFeatures />
			<LandingHowItWorks />
			<LandingCalculators />
			<LandingFaq />
			<LandingFinalCta />
			<LandingStructuredData />
		</main>
	);
}

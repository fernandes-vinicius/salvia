import type { Metadata } from "next";

import {
	LandingFaq,
	LandingFeatures,
	LandingFinalCta,
	LandingHero,
	LandingHowItWorks,
	LandingPainPoints,
} from "~/domains/landing";
import { APP_NAME } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: { absolute: `${APP_NAME} · Sua dieta e seus macros, sem planilha` },
	description:
		"Calcule seu gasto calórico, defina a meta em g/kg e monte a dieta batendo proteína, carboidrato e gordura, com a tabela TACO. Grátis.",
};

export default function LandingPage() {
	return (
		<main className="flex flex-col">
			<LandingHero />
			<LandingPainPoints />
			<LandingFeatures />
			<LandingHowItWorks />
			<LandingFaq />
			<LandingFinalCta />
		</main>
	);
}

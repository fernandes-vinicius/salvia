import type { MetadataRoute } from "next";

import { CALCULATORS } from "~/domains/calculators/data/calculators";
import { SITE_URL } from "~/shared/lib/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
	const page = (
		path: string,
		changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
		priority: number,
	) => ({ url: new URL(path, SITE_URL).href, changeFrequency, priority });

	return [
		page("/", "monthly", 1),
		page("/calculadoras", "monthly", 0.8),
		...CALCULATORS.map((calculator) => page(calculator.href, "monthly", 0.8)),
		page("/login", "yearly", 0.3),
		page("/como-calculamos", "yearly", 0.3),
		page("/termos", "yearly", 0.2),
		page("/privacidade", "yearly", 0.2),
	];
}

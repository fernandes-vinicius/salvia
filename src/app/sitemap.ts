import type { MetadataRoute } from "next";

import { SITE_URL } from "~/shared/lib/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: new URL("/", SITE_URL).href,
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: new URL("/login", SITE_URL).href,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];
}

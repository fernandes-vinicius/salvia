"use client";

import { useEffect } from "react";

import { analytics } from "~/shared/lib/analytics/analytics";

// Liga a sessão do PostHog a quem está logado (layout da área logada).
export function AnalyticsIdentify({
	user,
}: {
	user: { id: string; name: string; email: string };
}) {
	const { id, name, email } = user;
	useEffect(() => {
		analytics.identify({ id, name, email });
	}, [id, name, email]);
	return null;
}

"use client";

import type { ComponentProps } from "react";

import { analytics } from "~/shared/lib/analytics/analytics";

interface NewsLinkProps extends Omit<ComponentProps<"a">, "href"> {
	href: string;
	/** Propriedades do evento `manchete_aberta` (qual artigo, posição). */
	event: Record<string, string | number>;
}

// Link externo das manchetes que conta o clique no PostHog: é o número que
// vai pro relatório de parceria com o blog (o UTM conta do lado deles).
export function NewsLink({ href, event, onClick, ...props }: NewsLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			{...props}
			onClick={(clickEvent) => {
				analytics.track("manchete_aberta", event);
				onClick?.(clickEvent);
			}}
		/>
	);
}

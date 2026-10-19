"use client";

import { createContext, type ReactNode, useCallback, useContext } from "react";

import {
	type CelebrationLevel,
	type CelebrationOrigin,
	celebrate,
} from "~/shared/lib/celebrate";

const CelebrationContext = createContext(true);

// Preferência "Comemorações animadas" (Configurações) pro app logado.
export function CelebrationProvider({
	enabled,
	children,
}: {
	enabled: boolean;
	children: ReactNode;
}) {
	return <CelebrationContext value={enabled}>{children}</CelebrationContext>;
}

/** `celebrate` já respeitando a preferência da pessoa. */
export function useCelebrate() {
	const enabled = useContext(CelebrationContext);
	return useCallback(
		(level: CelebrationLevel, origin?: CelebrationOrigin) => {
			if (enabled) void celebrate(level, origin);
		},
		[enabled],
	);
}

/** Se as comemorações estão ligadas (pra animações em CSS). */
export function useCelebrationsEnabled() {
	return useContext(CelebrationContext);
}

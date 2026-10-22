"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

import {
	AI_MONTHLY_LIMITS,
	type AiFeature,
	type AiQuotaLeft,
	quotaLeftLabel,
} from "~/domains/ai-usage/utils/ai-usage";
import { Sparkles } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

// Cota de IA que sobra no mês, vinda do servidor (`monthlyQuotaLeft`) e
// descontada aqui a cada uso que deu certo. Só mostra: quem barra é o
// servidor. Sem provider (ou no beta, sem cota), não aparece nada.
interface AiQuotaContextValue {
	left: AiQuotaLeft;
	spend: (feature: AiFeature) => void;
}

const AiQuotaContext = createContext<AiQuotaContextValue | null>(null);

export function AiQuotaProvider({
	initial,
	children,
}: {
	initial: AiQuotaLeft;
	children: ReactNode;
}) {
	const [left, setLeft] = useState(initial);
	const spend = useCallback((feature: AiFeature) => {
		setLeft((current) => {
			const value = current[feature];
			if (value === undefined) return current;
			return { ...current, [feature]: Math.max(0, value - 1) };
		});
	}, []);
	const value = useMemo(() => ({ left, spend }), [left, spend]);
	return <AiQuotaContext value={value}>{children}</AiQuotaContext>;
}

/**
 * Cota do recurso: `left` (null = sem cota, ex.: beta) e `spend` pra
 * descontar depois de um uso que deu certo.
 */
export function useAiQuota(feature: AiFeature) {
	const context = useContext(AiQuotaContext);
	return {
		left: context?.left[feature] ?? null,
		spend: () => context?.spend(feature),
	};
}

/** "Restam 2 de 3 este mês." embaixo do botão do recurso. */
export function AiQuotaNote({
	feature,
	className,
}: {
	feature: AiFeature;
	className?: string;
}) {
	const { left } = useAiQuota(feature);
	if (left === null) return null;
	return (
		<p
			className={cn(
				"flex items-center justify-center gap-1.5 text-muted-foreground text-xs",
				className,
			)}
		>
			<Sparkles className="size-3.5 shrink-0" aria-hidden />
			{quotaLeftLabel(left, AI_MONTHLY_LIMITS[feature])}
		</p>
	);
}

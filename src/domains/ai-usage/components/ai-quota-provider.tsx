"use client";

import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";

import { registerAiInterestAction } from "~/domains/ai-usage/actions/ai-interest-actions";
import {
	AI_MONTHLY_LIMITS,
	type AiFeature,
	type AiQuotaLeft,
	INTEREST_COPY,
	quotaLeftLabel,
} from "~/domains/ai-usage/utils/ai-usage";
import { Sparkles } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";
import { cn } from "~/shared/lib/utils";

// Cota de IA que sobra no mês, vinda do servidor (`monthlyQuotaLeft`) e
// descontada aqui a cada uso que deu certo. Só mostra: quem barra é o
// servidor. Sem provider (ou no beta, sem cota), não aparece nada.
interface AiQuotaContextValue {
	left: AiQuotaLeft;
	spend: (feature: AiFeature) => void;
	interested: ReadonlySet<AiFeature>;
	markInterested: (feature: AiFeature) => void;
}

const AiQuotaContext = createContext<AiQuotaContextValue | null>(null);

export function AiQuotaProvider({
	initial,
	interested: initialInterested = [],
	children,
}: {
	initial: AiQuotaLeft;
	/** Recursos em que a pessoa já tocou em "Quero usar mais". */
	interested?: AiFeature[];
	children: ReactNode;
}) {
	const [left, setLeft] = useState(initial);
	const [interested, setInterested] = useState<ReadonlySet<AiFeature>>(
		() => new Set(initialInterested),
	);
	const markInterested = useCallback((feature: AiFeature) => {
		setInterested((current) => new Set(current).add(feature));
	}, []);
	const spend = useCallback((feature: AiFeature) => {
		setLeft((current) => {
			const value = current[feature];
			if (value === undefined) return current;
			return { ...current, [feature]: Math.max(0, value - 1) };
		});
	}, []);
	const value = useMemo(
		() => ({ left, spend, interested, markInterested }),
		[left, spend, interested, markInterested],
	);
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
		interested: context?.interested.has(feature) ?? false,
		markInterested: () => context?.markInterested(feature),
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
		<div
			className={cn(
				"flex flex-col items-center gap-1 text-center text-muted-foreground text-xs",
				className,
			)}
		>
			<p className="flex items-center justify-center gap-1.5">
				<Sparkles className="size-3.5 shrink-0" aria-hidden />
				{quotaLeftLabel(left, AI_MONTHLY_LIMITS[feature])}
			</p>
			{left <= 0 && <WantMoreAi feature={feature} />}
		</div>
	);
}

/** "Quero usar mais": anota o pedido e conta no PostHog (mede a procura). */
function WantMoreAi({ feature }: { feature: AiFeature }) {
	const { interested, markInterested } = useAiQuota(feature);
	const pathname = usePathname();
	const [pending, startTransition] = useTransition();

	if (interested) {
		return <p className="text-pretty">{INTEREST_COPY.thanks}</p>;
	}

	const request = () =>
		startTransition(async () => {
			const result = await registerAiInterestAction(feature);
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			markInterested();
			analytics.track("quero_mais_ia", { recurso: feature, pagina: pathname });
		});

	return (
		<Button
			type="button"
			variant="link"
			size="xs"
			onClick={request}
			disabled={pending}
		>
			{INTEREST_COPY.button}
		</Button>
	);
}

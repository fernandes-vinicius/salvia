"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	applyCalibrationAction,
	completeReviewAction,
	restartDietCycleAction,
} from "~/domains/goal/actions/calibration-actions";
import {
	CALIBRATION_RULES,
	type CalibrationAnalysis,
	describeWeeklyChange,
} from "~/domains/goal/utils/calibration";
import {
	carbsForKcal,
	previousCheckpoint,
	type ReviewStatus,
} from "~/domains/goal/utils/review";
import { CalendarDays, Loader2Icon } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";
import { formatFixed, formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface DietReviewCardProps {
	status: ReviewStatus;
	/** O mesmo ajuste pelo peso do card "Ajuste pelo seu peso". */
	analysis: CalibrationAnalysis;
	/** Peso no começo × agora (null com menos de 2 pesagens). */
	weight: { fromKg: number; toKg: number; changeKg: number } | null;
	/** % das refeições seguidas desde o começo (null sem check-ins). */
	adherence: number | null;
	className?: string;
}

type Pending = "apply" | "done" | "restart" | null;

// Dia da dieta e as revisões de 15 e 30 dias (depois, a cada 30). Fora do
// marco, só a contagem; no marco, o balanço do período com a sugestão do
// ajuste pelo peso traduzida em carboidrato.
export function DietReviewCard({
	status,
	analysis,
	weight,
	adherence,
	className,
}: DietReviewCardProps) {
	const router = useRouter();
	const [pending, setPending] = useState<Pending>(null);

	async function run(kind: Exclude<Pending, null>) {
		setPending(kind);
		const result =
			kind === "apply"
				? await applyCalibrationAction()
				: kind === "done"
					? await completeReviewAction()
					: await restartDietCycleAction();
		setPending(null);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		if (kind !== "restart") {
			analytics.track("revisao_concluida", {
				dia: status.checkpoint,
				ajustou: kind === "apply",
			});
		}
		toast.success(
			kind === "apply"
				? "Meta ajustada e revisão concluída."
				: kind === "done"
					? "Revisão concluída. Até a próxima!"
					: "Pronto: a dieta conta a partir de hoje.",
		);
		router.refresh();
	}

	if (!status.due) {
		const previous = previousCheckpoint(status.checkpoint);
		const progress =
			((status.day - previous) / (status.checkpoint - previous)) * 100;
		return (
			<section
				aria-labelledby="dia-da-dieta"
				className={cn(
					"flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5",
					className,
				)}
			>
				<h2
					id="dia-da-dieta"
					className="flex items-center gap-2 font-heading font-semibold"
				>
					<CalendarDays className="size-4 text-primary" />
					Dia {formatNumber(status.day)} da sua dieta
				</h2>
				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary"
						style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
					/>
				</div>
				<p className="text-muted-foreground text-sm">
					Próxima revisão em {formatNumber(status.daysLeft)}{" "}
					{status.daysLeft === 1 ? "dia" : "dias"} (dia {status.checkpoint}).
					Até lá, marque o check-in e se pese uma vez por semana.
				</p>
			</section>
		);
	}

	return (
		<section
			aria-labelledby="revisao-dieta"
			className={cn(
				"flex flex-col gap-3 rounded-3xl bg-secondary p-4 md:p-5",
				className,
			)}
		>
			<h2
				id="revisao-dieta"
				className="flex items-center gap-2 font-heading font-semibold"
			>
				<CalendarDays className="size-4 text-primary" />
				Revisão de {status.checkpoint} dias
			</h2>
			<p className="text-pretty text-secondary-foreground text-sm">
				Dia {formatNumber(status.day)} da sua dieta: hora de ver se ela está
				funcionando.
			</p>

			<dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
				<div className="flex flex-col gap-0.5 rounded-2xl bg-card px-4 py-3">
					<dt className="text-muted-foreground text-xs">Peso desde o começo</dt>
					<dd className="font-heading font-semibold tabular-nums">
						{weight
							? `${formatFixed(weight.fromKg)} → ${formatFixed(weight.toKg)} kg (${weight.changeKg > 0 ? "+" : weight.changeKg < 0 ? "−" : ""}${formatFixed(Math.abs(weight.changeKg))} kg)`
							: "Poucas pesagens"}
					</dd>
				</div>
				<div className="flex flex-col gap-0.5 rounded-2xl bg-card px-4 py-3">
					<dt className="text-muted-foreground text-xs">Refeições seguidas</dt>
					<dd className="font-heading font-semibold tabular-nums">
						{adherence === null ? "Sem check-in" : `${adherence}%`}
					</dd>
				</div>
			</dl>

			<Verdict analysis={analysis} />

			<div className="flex flex-wrap gap-2">
				{analysis.kind === "suggest" && (
					<Button disabled={pending !== null} onClick={() => run("apply")}>
						{pending === "apply" && (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						)}
						Aplicar ajuste
					</Button>
				)}
				<Button
					variant={analysis.kind === "suggest" ? "ghost" : "default"}
					disabled={pending !== null}
					onClick={() => run("done")}
				>
					{pending === "done" && (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					)}
					{analysis.kind === "suggest"
						? "Manter como está"
						: "Concluir revisão"}
				</Button>
			</div>
			<button
				type="button"
				disabled={pending !== null}
				onClick={() => run("restart")}
				className="self-start rounded-sm text-muted-foreground text-xs underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
			>
				Comecei a dieta de novo: contar a partir de hoje
			</button>
		</section>
	);
}

function Verdict({ analysis }: { analysis: CalibrationAnalysis }) {
	switch (analysis.kind) {
		case "need-data":
			return (
				<p className="text-pretty text-sm">
					Pra saber se a meta está funcionando, faltam pesagens: com{" "}
					{CALIBRATION_RULES.minWeighIns} em {CALIBRATION_RULES.minDays} dias o
					app compara com o esperado.{" "}
					<Link
						href="/medidas"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Registrar peso
					</Link>
				</p>
			);
		case "on-track":
			return (
				<p className="text-pretty text-sm">
					<strong className="font-semibold">Está no ritmo.</strong> Você está{" "}
					{describeWeeklyChange(analysis.observedWeeklyKg)} por semana, perto do
					esperado pela meta. Continue assim.
				</p>
			);
		case "low-adherence":
			return (
				<p className="text-pretty text-sm">
					O peso está fora do esperado (
					{describeWeeklyChange(analysis.observedWeeklyKg)} por semana), mas
					você seguiu {analysis.adherence}% das refeições. Antes de mudar a
					meta, tente seguir pelo menos {CALIBRATION_RULES.minAdherence}% até a
					próxima revisão.
				</p>
			);
		case "suggest": {
			const { carbsGrams, riceGrams } = carbsForKcal(analysis.deltaKcal);
			const less = analysis.deltaKcal < 0;
			return (
				<div className="flex flex-col gap-1 text-sm">
					<p className="text-pretty">
						Você está {describeWeeklyChange(analysis.observedWeeklyKg)} por
						semana; o esperado era{" "}
						{describeWeeklyChange(analysis.expectedWeeklyKg)}.
					</p>
					<p className="text-pretty font-heading font-semibold">
						Sugestão: {formatNumber(Math.abs(analysis.deltaKcal))} kcal a{" "}
						{less ? "menos" : "mais"} por dia, cerca de {carbsGrams} g de
						carboidrato (≈ {riceGrams} g de arroz cozido).
					</p>
				</div>
			);
		}
	}
}

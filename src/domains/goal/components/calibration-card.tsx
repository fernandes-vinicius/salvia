"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	applyCalibrationAction,
	resetCalibrationAction,
} from "~/domains/goal/actions/calibration-actions";
import type { GoalCalibration } from "~/domains/goal/types/goal-types";
import {
	CALIBRATION_RULES,
	type CalibrationAnalysis,
	describeWeeklyChange,
} from "~/domains/goal/utils/calibration";
import { CircleCheck, Loader2Icon, Scale } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface CalibrationCardProps {
	analysis: CalibrationAnalysis;
	calibration: GoalCalibration;
	className?: string;
}

/** "Agora não": esconde a mesma sugestão por uma semana, só neste aparelho. */
const DISMISS_KEY = "salvia:ajuste-dispensado";
const DISMISS_DAYS = 7;

function isDismissed(deltaKcal: number) {
	try {
		const raw = localStorage.getItem(DISMISS_KEY);
		if (!raw) return false;
		const { delta, until } = JSON.parse(raw) as {
			delta: number;
			until: number;
		};
		return delta === deltaKcal && Date.now() < until;
	} catch {
		return false;
	}
}

function formatSignedKcal(kcal: number) {
	return `${kcal > 0 ? "+" : "−"}${formatNumber(Math.abs(kcal))} kcal`;
}

function formatDay(date: string) {
	return date.split("-").reverse().slice(0, 2).join("/");
}

// Ajuste automático da meta pelo peso: mostra o que falta pra conferir, se
// está no ritmo ou a sugestão de kcal com "Aplicar". Linguagem de leigo.
export function CalibrationCard({
	analysis,
	calibration,
	className,
}: CalibrationCardProps) {
	const router = useRouter();
	const [pending, setPending] = useState<"apply" | "reset" | null>(null);
	const [dismissed, setDismissed] = useState(false);

	const suggestion = analysis.kind === "suggest" ? analysis.deltaKcal : null;
	useEffect(() => {
		if (suggestion !== null) setDismissed(isDismissed(suggestion));
	}, [suggestion]);

	async function run(kind: "apply" | "reset") {
		setPending(kind);
		const result =
			kind === "apply"
				? await applyCalibrationAction()
				: await resetCalibrationAction();
		setPending(null);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success(
			kind === "apply"
				? "Meta ajustada. A próxima conferência começa a contar de hoje."
				: "Pronto: voltamos ao gasto calculado pela fórmula.",
		);
		router.refresh();
	}

	function dismiss() {
		if (suggestion === null) return;
		try {
			localStorage.setItem(
				DISMISS_KEY,
				JSON.stringify({
					delta: suggestion,
					until: Date.now() + DISMISS_DAYS * 86_400_000,
				}),
			);
		} catch {
			// Sem armazenamento: some só até recarregar.
		}
		setDismissed(true);
	}

	if (dismissed) return null;

	return (
		<section
			aria-labelledby="ajuste-peso"
			className={cn(
				"flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5",
				analysis.kind === "suggest" && "bg-secondary",
				className,
			)}
		>
			<h2
				id="ajuste-peso"
				className="flex items-center gap-2 font-heading font-semibold"
			>
				{analysis.kind === "on-track" ? (
					<CircleCheck className="size-4 text-primary" />
				) : (
					<Scale className="size-4 text-primary" />
				)}
				Ajuste pelo seu peso
			</h2>

			{analysis.kind === "need-data" && (
				<NeedData analysis={analysis} calibration={calibration} />
			)}

			{analysis.kind === "on-track" && (
				<p className="text-pretty text-sm">
					Você está{" "}
					<strong>{describeWeeklyChange(analysis.observedWeeklyKg)}</strong> por
					semana, perto do esperado pela sua meta. Está funcionando: continue
					assim e siga se pesando toda semana.
				</p>
			)}

			{analysis.kind === "suggest" && (
				<>
					<p className="text-pretty text-sm">
						Nas últimas {Math.round(analysis.days / 7)} semanas você está{" "}
						<strong>{describeWeeklyChange(analysis.observedWeeklyKg)}</strong>{" "}
						por semana. Pela sua meta, o esperado era estar{" "}
						{describeWeeklyChange(analysis.expectedWeeklyKg)}. Se você seguiu a
						dieta, seu corpo gasta {analysis.deltaKcal < 0 ? "menos" : "mais"}{" "}
						do que a conta estimou.
					</p>
					<p className="font-heading font-semibold">
						Sugestão: comer {formatNumber(Math.abs(analysis.deltaKcal))} kcal a{" "}
						{analysis.deltaKcal < 0 ? "menos" : "mais"} por dia.
					</p>
					<div className="flex flex-wrap gap-2">
						<Button disabled={pending !== null} onClick={() => run("apply")}>
							{pending === "apply" && (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							)}
							Aplicar ajuste
						</Button>
						<Button
							variant="ghost"
							disabled={pending !== null}
							onClick={dismiss}
						>
							Agora não
						</Button>
					</div>
				</>
			)}

			{calibration.kcal !== 0 && (
				<p className="flex flex-wrap items-center gap-x-1 text-muted-foreground text-xs">
					Seu gasto já inclui {formatSignedKcal(calibration.kcal)} por dia de
					ajuste pelo peso.
					<button
						type="button"
						disabled={pending !== null}
						onClick={() => run("reset")}
						className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
					>
						Desfazer ajustes
					</button>
				</p>
			)}
		</section>
	);
}

function NeedData({
	analysis,
	calibration,
}: {
	analysis: Extract<CalibrationAnalysis, { kind: "need-data" }>;
	calibration: GoalCalibration;
}) {
	const { minWeighIns, minDays } = CALIBRATION_RULES;

	return (
		<>
			<p className="text-pretty text-muted-foreground text-sm">
				{calibration.since
					? `Último ajuste em ${formatDay(calibration.since)}. Pra conferir de novo,`
					: "Pra saber se a meta está funcionando,"}{" "}
				pese-se uma vez por semana (de manhã, em jejum) e registre em Medidas.
				Com {minWeighIns} pesagens em {minDays} dias, o app compara com o
				esperado e sugere ajustes.
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded-full bg-muted px-3 py-1 text-xs tabular-nums">
					Pesagens: {Math.min(analysis.weighIns, minWeighIns)} de {minWeighIns}
				</span>
				<span className="rounded-full bg-muted px-3 py-1 text-xs tabular-nums">
					Dias: {Math.min(analysis.days, minDays)} de {minDays}
				</span>
				<Button
					variant="link"
					size="sm"
					className="px-1"
					nativeButton={false}
					render={<Link href="/medidas" />}
				>
					Registrar peso
				</Button>
			</div>
		</>
	);
}

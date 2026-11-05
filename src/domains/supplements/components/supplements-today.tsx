"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { setSupplementCheckinAction } from "~/domains/supplements/actions/supplement-actions";
import type {
	Supplement,
	SupplementMealRef,
} from "~/domains/supplements/types/supplement-types";
import {
	doseLabel,
	timingLabel,
} from "~/domains/supplements/utils/supplements";
import { Check, Pill } from "~/shared/components/icons";
import { analytics } from "~/shared/lib/analytics/analytics";
import { cn } from "~/shared/lib/utils";

interface SupplementsTodayProps {
	/** Só os que valem hoje (`supplementsForDay`). */
	supplements: Supplement[];
	meals: SupplementMealRef[];
	/** Ids já marcados hoje. */
	initialTaken: string[];
	className?: string;
}

// "Tomei" de cada suplemento do dia, no check-in do Início. Não conta pro
// dia completo. Os de "dias de treino" aparecem todo dia como "se treinar".
export function SupplementsToday({
	supplements,
	meals,
	initialTaken,
	className,
}: SupplementsTodayProps) {
	const router = useRouter();
	const [taken, setTaken] = useState(() => new Set(initialTaken));

	async function toggle(supplement: Supplement) {
		const next = !taken.has(supplement.id);
		const previous = taken;
		const updated = new Set(taken);
		if (next) updated.add(supplement.id);
		else updated.delete(supplement.id);
		setTaken(updated);

		const result = await setSupplementCheckinAction({
			supplementId: supplement.id,
			taken: next,
		});
		if (result.ok && next) analytics.track("suplemento_tomado");
		if (!result.ok) {
			setTaken(previous);
			if (result.stale) {
				toast.info("Seus suplementos mudaram em outra aba. Atualizamos.");
				router.refresh();
			} else {
				toast.error(result.error);
			}
		}
	}

	const count = supplements.filter((s) => taken.has(s.id)).length;

	return (
		<div className={cn("flex flex-col gap-2.5", className)}>
			<div className="flex flex-wrap items-baseline justify-between gap-x-3">
				<h3 className="flex items-center gap-2 font-medium text-sm">
					<Pill className="size-4 text-primary" aria-hidden />
					Suplementos de hoje
				</h3>
				<p className="text-muted-foreground text-xs tabular-nums">
					{count} de {supplements.length} tomados
				</p>
			</div>
			<ul className="flex flex-wrap gap-2">
				{supplements.map((supplement) => {
					const pressed = taken.has(supplement.id);
					return (
						<li key={supplement.id} className="min-w-0 max-w-full">
							<button
								type="button"
								aria-pressed={pressed}
								onClick={() => toggle(supplement)}
								className={cn(
									"flex max-w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
									pressed
										? "bg-primary text-primary-foreground"
										: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
								)}
							>
								<span
									aria-hidden
									className={cn(
										"flex size-5 shrink-0 items-center justify-center rounded-full",
										pressed
											? "bg-primary-foreground/20"
											: "ring-1 ring-foreground/20",
									)}
								>
									{pressed && (
										<Check className="size-3.5 motion-safe:animate-check" />
									)}
								</span>
								<span className="flex min-w-0 flex-col">
									<span className="truncate font-medium">
										{supplement.name}{" "}
										<span className="font-normal tabular-nums">
											{doseLabel(supplement.dose, supplement.unit)}
										</span>
									</span>
									<span
										className={cn(
											"truncate text-xs",
											pressed
												? "text-primary-foreground"
												: "text-muted-foreground",
										)}
									>
										{timingLabel(supplement, meals)}
										{supplement.days === "training_days" && " · se treinar"}
									</span>
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

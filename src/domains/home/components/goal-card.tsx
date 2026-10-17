import Link from "next/link";

import type { Goal, GoalTargets } from "~/domains/goal/types/goal-types";
import { OBJECTIVES } from "~/domains/goal/utils/goal";
import { ArrowRight, Target } from "~/shared/components/icons";
import { formatNumber } from "~/shared/lib/format";

interface GoalCardProps {
	goal: Goal;
	targets: GoalTargets;
	tdee: number;
}

export function GoalCard({ goal, targets, tdee }: GoalCardProps) {
	const objective = OBJECTIVES.find((o) => o.value === goal.objective);
	const weekly = Math.abs(targets.weeklyChangeKg);

	return (
		<section
			aria-label="Seu objetivo"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="flex items-center gap-2 font-heading font-semibold">
				<Target className="size-4 text-primary" />
				Seu objetivo
			</h2>
			<div className="flex flex-col gap-1">
				<p className="font-medium">{objective?.label}</p>
				<p className="text-muted-foreground text-sm">
					{goal.objective === "maintain"
						? "Comendo o mesmo que você gasta."
						: `~${formatNumber(weekly, 2)} kg por semana`}
				</p>
			</div>
			<dl className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3 text-sm tabular-nums">
				<div>
					<dt className="text-muted-foreground text-xs">Gasto</dt>
					<dd className="font-heading font-semibold">
						{formatNumber(tdee)} kcal
					</dd>
				</div>
				<ArrowRight className="size-4 text-muted-foreground" />
				<div className="text-right">
					<dt className="text-muted-foreground text-xs">Meta</dt>
					<dd className="font-heading font-semibold">
						{formatNumber(targets.calories)} kcal
					</dd>
				</div>
			</dl>
			<Link
				href="/meta"
				className="self-start font-medium text-primary text-xs underline-offset-4 hover:underline"
			>
				Ajustar meta
			</Link>
		</section>
	);
}

import Link from "next/link";

import { ArrowRight, Circle, CircleCheck } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { cn } from "~/shared/lib/utils";

export interface SetupStep {
	label: string;
	description: string;
	href: "/tmb" | "/meta" | "/dieta";
	done: boolean;
}

// Primeiros passos na ordem certa (TMB → Meta → Dieta). Some quando tudo
// estiver feito.
export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
	const next = steps.find((step) => !step.done);
	if (!next) return null;
	const doneCount = steps.filter((step) => step.done).length;

	return (
		<section
			aria-label="Primeiros passos"
			className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="font-heading font-semibold">Primeiros passos</h2>
				<span className="text-muted-foreground text-xs tabular-nums">
					{doneCount} de {steps.length}
				</span>
			</div>
			<ol className="flex flex-col gap-3">
				{steps.map((step) => (
					<li key={step.href} className="flex items-start gap-3">
						{step.done ? (
							<CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" />
						) : (
							<Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
						)}
						<span className="flex flex-col">
							<span
								className={cn(
									"font-medium text-sm",
									step.done && "text-muted-foreground line-through",
								)}
							>
								{step.label}
							</span>
							{!step.done && (
								<span className="text-muted-foreground text-xs">
									{step.description}
								</span>
							)}
						</span>
					</li>
				))}
			</ol>
			<Button
				className="self-start"
				nativeButton={false}
				render={<Link href={next.href} />}
			>
				{next.label}
				<ArrowRight data-icon="inline-end" />
			</Button>
		</section>
	);
}

"use client";

import { useState } from "react";

import { generateWeeklySummaryAction } from "~/domains/weekly-summary/actions/weekly-summary-actions";
import type { WeeklySummary } from "~/domains/weekly-summary/schemas/weekly-summary-schema";
import { Loader2Icon, Sparkles } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";

// Resumo da semana (beta) no Início: a IA escreve a partir dos fatos que o
// app calcula (peso, cintura, check-in, ajuste pelo peso). Um por semana,
// gerado quando a pessoa pede.
export function WeeklySummaryCard({
	initialSummary,
}: {
	initialSummary: WeeklySummary | null;
}) {
	const [summary, setSummary] = useState(initialSummary);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function generate() {
		setPending(true);
		setError(null);
		const result = await generateWeeklySummaryAction();
		setPending(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		analytics.track("resumo_semanal_gerado");
		setSummary(result.data);
	}

	return (
		<section
			aria-labelledby="resumo-semana"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2
				id="resumo-semana"
				className="flex items-center gap-2 font-heading font-semibold"
			>
				<Sparkles className="size-4 text-primary" />
				{summary ? summary.title : "Resumo da semana (beta)"}
			</h2>

			{summary ? (
				<>
					<p className="text-pretty text-sm leading-relaxed">{summary.text}</p>
					<p className="text-pretty rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground text-sm">
						<strong className="font-semibold">Próximo passo:</strong>{" "}
						{summary.nextStep}
					</p>
					<p className="text-muted-foreground text-xs">
						Escrito por IA a partir dos seus dados da semana. Um resumo novo
						toda segunda-feira.
					</p>
				</>
			) : (
				<>
					<p className="text-pretty text-muted-foreground text-sm">
						Um balanço curto da sua semana (peso, medidas e check-in) com um
						próximo passo.
					</p>
					{error && (
						<p role="alert" className="text-pretty text-sm">
							{error}
						</p>
					)}
					<div>
						<Button variant="secondary" disabled={pending} onClick={generate}>
							{pending ? (
								<Loader2Icon
									data-icon="inline-start"
									className="animate-spin"
								/>
							) : (
								<Sparkles data-icon="inline-start" />
							)}
							Gerar resumo da semana
						</Button>
					</div>
				</>
			)}
		</section>
	);
}

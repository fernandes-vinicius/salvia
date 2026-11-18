import Link from "next/link";

import { Scale } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { formatNumber } from "~/shared/lib/format";

interface DayWeightCardProps {
	/** Peso registrado em Medidas nesse dia (null sem pesagem). */
	weightKg: number | null;
}

// Pesagem do dia aberto no diário (só em dias passados; hoje já tem o
// resumo de Medidas). Registrar ou corrigir fica em Medidas, que tem a data.
export function DayWeightCard({ weightKg }: DayWeightCardProps) {
	return (
		<section
			aria-labelledby="day-weight-title"
			className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<h2
					id="day-weight-title"
					className="flex items-center gap-2 font-heading font-semibold"
				>
					<Scale className="size-4 text-primary" aria-hidden />
					Pesagem
				</h2>
				<p className="text-muted-foreground text-sm tabular-nums">
					{weightKg === null ? (
						"Sem pesagem nesse dia."
					) : (
						<>
							<span className="font-heading font-semibold text-foreground text-lg">
								{formatNumber(weightKg, 1)} kg
							</span>{" "}
							nesse dia
						</>
					)}
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				nativeButton={false}
				render={<Link href="/medidas" />}
			>
				{weightKg === null ? "Registrar em Medidas" : "Ver em Medidas"}
			</Button>
		</section>
	);
}

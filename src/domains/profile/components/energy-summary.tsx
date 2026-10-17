import type { EnergyBreakdown } from "~/domains/profile/types/profile-types";
import { SaveStatus } from "~/shared/components/save-status";
import type { AutosaveStatus } from "~/shared/hooks/use-autosave";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface EnergySummaryProps {
	energy: EnergyBreakdown;
	status: AutosaveStatus;
	isExample: boolean;
	className?: string;
}

export function EnergySummary({
	energy,
	status,
	isExample,
	className,
}: EnergySummaryProps) {
	// Composição do gasto, na ordem em que soma. Treinos desligados somem.
	const rows = [
		{ label: "Em repouso (TMB)", kcal: energy.bmr, isBase: true },
		{ label: "Dia a dia", kcal: energy.daily },
		{ label: "Musculação", kcal: energy.strength },
		{ label: "Cardio", kcal: energy.cardio },
		{ label: "Digestão", kcal: energy.digestion },
	].filter((row) => row.isBase || row.kcal > 0);

	return (
		<section
			aria-label="Seu gasto calórico"
			className={cn(
				"flex flex-col gap-1 rounded-3xl bg-primary p-4 text-primary-foreground md:p-5",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<p className="text-sm opacity-80">Gasto calórico diário</p>
				<SaveStatus status={status} isExample={isExample} />
			</div>

			<p className="font-heading font-semibold text-4xl tabular-nums md:text-5xl">
				{formatNumber(energy.tdee)}
				<span className="ml-1.5 font-normal text-lg opacity-80">kcal</span>
			</p>

			<p className="hidden text-sm opacity-80 md:block">
				É quanto seu corpo gasta por dia, somando tudo abaixo.
			</p>

			<dl className="mt-3 flex flex-col divide-y divide-primary-foreground/15 rounded-2xl bg-primary-foreground/10 px-4">
				{rows.map((row) => (
					<div
						key={row.label}
						className="flex items-center justify-between gap-4 py-2.5"
					>
						<dt className="shrink-0 text-sm opacity-80">{row.label}</dt>
						<dd className="font-heading font-semibold tabular-nums">
							{row.isBase ? "" : "+"}
							{formatNumber(row.kcal)} kcal
						</dd>
					</div>
				))}
			</dl>

			{isExample && (
				<p className="mt-2 text-xs opacity-80">
					Valores de exemplo. Ajuste com os seus dados: salvamos sozinhos a cada
					mudança.
				</p>
			)}
		</section>
	);
}

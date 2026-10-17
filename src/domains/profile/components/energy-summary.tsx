import { SaveStatus } from "~/domains/profile/components/save-status";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	calculateBmr,
	calculateTdee,
	findActivityLevel,
} from "~/domains/profile/utils/energy";
import type { AutosaveStatus } from "~/shared/hooks/use-autosave";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface EnergySummaryProps {
	profile: BodyProfile;
	status: AutosaveStatus;
	isExample: boolean;
	className?: string;
}

export function EnergySummary({
	profile,
	status,
	isExample,
	className,
}: EnergySummaryProps) {
	const bmr = calculateBmr(profile);
	const tdee = calculateTdee(profile);
	const level = findActivityLevel(profile.activityFactor);

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
				{formatNumber(tdee)}
				<span className="ml-1.5 font-normal text-lg opacity-80">kcal</span>
			</p>

			<p className="hidden text-sm opacity-80 md:block">
				É quanto seu corpo gasta por dia, contando a sua rotina.
			</p>

			{/* Linhas rótulo/valor: cabem na coluna estreita do desktop sem
			    quebrar nomes longos como "Moderadamente ativo". */}
			<dl className="mt-3 flex flex-col divide-y divide-primary-foreground/15 rounded-2xl bg-primary-foreground/10 px-4">
				<div className="flex items-center justify-between gap-4 py-3">
					<dt className="shrink-0 text-sm opacity-80">Em repouso (TMB)</dt>
					<dd className="font-heading font-semibold tabular-nums">
						{formatNumber(bmr)} kcal
					</dd>
				</div>
				<div className="flex items-center justify-between gap-4 py-3">
					<dt className="shrink-0 text-sm opacity-80">Rotina</dt>
					<dd className="text-right font-heading font-semibold">
						{level?.label ?? "—"}
					</dd>
				</div>
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

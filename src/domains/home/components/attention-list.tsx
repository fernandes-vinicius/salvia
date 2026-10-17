import Link from "next/link";

import type { AttentionItem } from "~/domains/home/utils/home";
import { TriangleAlertIcon } from "~/shared/components/icons";

// Avisos que pedem ação (meta, dados suspeitos, refeições vazias). Só aparece
// quando há algo.
export function AttentionList({ items }: { items: AttentionItem[] }) {
	if (items.length === 0) return null;

	return (
		<section
			aria-label="Pontos de atenção"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<h2 className="flex items-center gap-2 font-heading font-semibold">
				<TriangleAlertIcon className="size-4 text-destructive" />
				Pontos de atenção
			</h2>
			<ul className="flex flex-col divide-y divide-border">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0"
					>
						<p className="text-sm">{item.message}</p>
						<Link
							href={item.href}
							className="self-start font-medium text-primary text-xs underline-offset-4 hover:underline"
						>
							{item.action}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}

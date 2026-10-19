import * as Icons from "~/shared/components/icons";

/** Todos os ícones exportados por `~/shared/components/icons`. */
export function IconGallery() {
	const entries = Object.entries(Icons).filter(
		([name, value]) =>
			/^[A-Z]/.test(name) &&
			(typeof value === "function" || typeof value === "object"),
	) as [string, Icons.LucideIcon][];

	return (
		<div className="not-prose my-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
			{entries.map(([name, Icon]) => (
				<div
					key={name}
					className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-center ring-1 ring-foreground/5"
				>
					<Icon className="size-5 text-primary" aria-hidden />
					<code className="break-all text-[0.6875rem] text-foreground">
						{name}
					</code>
				</div>
			))}
		</div>
	);
}

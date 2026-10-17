import type { ReactNode } from "react";

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
	return (
		<header className="flex flex-col gap-1">
			<h1 className="font-heading font-semibold text-2xl sm:text-3xl">
				{title}
			</h1>
			{description && (
				<p className="text-muted-foreground text-sm">{description}</p>
			)}
		</header>
	);
}

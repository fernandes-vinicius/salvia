import type { ReactNode } from "react";

import { cn } from "~/shared/lib/utils";

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
	return (
		<header className={cn("flex flex-col gap-1", className)}>
			<h1 className="font-heading font-semibold text-2xl sm:text-3xl">
				{title}
			</h1>
			{description && (
				<p className="text-muted-foreground text-sm">{description}</p>
			)}
		</header>
	);
}

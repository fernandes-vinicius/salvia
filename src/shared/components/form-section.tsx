import type { ReactNode } from "react";

interface FormSectionProps {
	title: string;
	description?: ReactNode;
	children: ReactNode;
}

export function FormSection({
	title,
	description,
	children,
}: FormSectionProps) {
	return (
		<section className="flex flex-col gap-3">
			<div className="flex flex-col gap-0.5">
				<h2 className="font-heading font-semibold text-lg">{title}</h2>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			{children}
		</section>
	);
}

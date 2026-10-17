import { Leaf } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<span className={cn("flex items-center gap-2", className)}>
			<span className="flex size-8 items-center justify-center rounded-full bg-secondary text-primary">
				<Leaf className="size-4" />
			</span>
			<span className="font-heading font-semibold text-lg">Dieta</span>
		</span>
	);
}

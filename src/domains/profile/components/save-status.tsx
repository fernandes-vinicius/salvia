import {
	CircleAlert,
	CloudCheck,
	Loader2Icon,
} from "~/shared/components/icons";
import type { AutosaveStatus } from "~/shared/hooks/use-autosave";

interface SaveStatusProps {
	status: AutosaveStatus;
	isExample: boolean;
}

export function SaveStatus({ status, isExample }: SaveStatusProps) {
	const content = (() => {
		if (status === "pending" || status === "saving") {
			return (
				<>
					<Loader2Icon className="size-3.5 animate-spin" /> Salvando…
				</>
			);
		}
		if (status === "error") {
			return (
				<>
					<CircleAlert className="size-3.5" /> Não salvou
				</>
			);
		}
		if (isExample) return "Exemplo";
		return (
			<>
				<CloudCheck className="size-3.5" /> Salvo
			</>
		);
	})();

	return (
		<output className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 font-medium text-xs">
			{content}
		</output>
	);
}

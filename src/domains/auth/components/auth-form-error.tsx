import { TriangleAlertIcon } from "~/shared/components/icons";
import { Alert, AlertDescription } from "~/shared/components/ui/alert";

export function AuthFormError({ message }: { message: string | null }) {
	if (!message) return null;

	return (
		<Alert variant="destructive" className="text-left">
			<TriangleAlertIcon />
			{/* Cor cheia: a padrão (90%) fica abaixo de 4,5:1 sobre o card. */}
			<AlertDescription className="text-destructive!">
				{message}
			</AlertDescription>
		</Alert>
	);
}

/** Erros do Conform no formato do `FieldError`. */
export function fieldErrors(errors?: string[]) {
	return errors?.map((message) => ({ message }));
}

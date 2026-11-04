import { MailCheck } from "~/shared/components/icons";

interface CheckInboxProps {
	title: string;
	email?: string;
	children: React.ReactNode;
}

export function CheckInbox({ title, email, children }: CheckInboxProps) {
	return (
		<output className="flex flex-col items-center gap-3 rounded-3xl bg-secondary p-5 text-center">
			<MailCheck className="size-6 text-primary" aria-hidden />
			<p className="font-heading font-semibold">{title}</p>
			<p className="text-pretty text-muted-foreground text-sm">
				{children}
				{email && (
					<>
						{" "}
						<strong className="break-all font-medium text-foreground">
							{email}
						</strong>
					</>
				)}
				. Abra o link pra continuar. Não chegou? Veja no spam ou tente de novo
				em alguns minutos.
			</p>
		</output>
	);
}

import Link from "next/link";

import { Leaf } from "~/shared/components/icons";
import { Card, CardContent } from "~/shared/components/ui/card";

interface AuthCardProps {
	title: string;
	description?: React.ReactNode;
	children: React.ReactNode;
}

/** Moldura das telas de entrar, criar conta e senha. */
export function AuthCard({ title, description, children }: AuthCardProps) {
	return (
		<Card className="w-full max-w-sm ring-0">
			<CardContent className="flex flex-col items-center gap-8 py-4 text-center">
				<div className="flex flex-col items-center gap-4">
					<Link
						href="/"
						aria-label="Página inicial"
						className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Leaf className="size-6" />
					</Link>
					<div className="flex flex-col gap-1.5">
						<h1 className="font-heading font-semibold text-2xl">{title}</h1>
						{description}
					</div>
				</div>
				{children}
			</CardContent>
		</Card>
	);
}

/** Link de rodapé das telas de conta ("Já tem conta? Entrar"). */
export function AuthFooterLink({
	text,
	href,
	label,
}: {
	text: string;
	href: string;
	label: string;
}) {
	return (
		<p className="text-muted-foreground text-sm">
			{text}{" "}
			<Link
				href={href}
				className="font-medium text-foreground underline underline-offset-4"
			>
				{label}
			</Link>
		</p>
	);
}

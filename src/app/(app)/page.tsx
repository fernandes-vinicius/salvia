import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import {
	ChevronRight,
	Flame,
	type LucideIcon,
	Salad,
	Target,
} from "~/shared/components/icons";
import { Card } from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { APP_TAGLINE } from "~/shared/lib/app-config";

const shortcuts: {
	href: "/tmb" | "/meta" | "/dieta";
	title: string;
	description: string;
	icon: LucideIcon;
}[] = [
	{
		href: "/tmb",
		title: "TMB",
		description: "Seus dados e o gasto calórico diário.",
		icon: Flame,
	},
	{
		href: "/meta",
		title: "Meta",
		description: "Objetivo, calorias e macros do dia.",
		icon: Target,
	},
	{
		href: "/dieta",
		title: "Dieta",
		description: "Refeições, alimentos e macros do dia.",
		icon: Salad,
	},
];

export default function HomePage() {
	return (
		<main className="container-wrapper flex flex-col gap-8">
			<header className="flex flex-col gap-1">
				<Suspense fallback={<Skeleton className="h-8 w-48" />}>
					<Greeting />
				</Suspense>
				<p className="text-muted-foreground text-sm">{APP_TAGLINE}</p>
			</header>

			<nav aria-label="Atalhos" className="grid gap-3">
				{shortcuts.map(({ href, title, description, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className="group rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Card className="flex-row items-center gap-4 px-5 ring-0 transition-colors group-hover:bg-accent">
							<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
								<Icon className="size-5" />
							</span>
							<span className="flex min-w-0 flex-1 flex-col gap-0.5">
								<span className="font-heading font-semibold">{title}</span>
								<span className="text-muted-foreground text-sm">
									{description}
								</span>
							</span>
							<ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
						</Card>
					</Link>
				))}
			</nav>
		</main>
	);
}

async function Greeting() {
	const user = await getCurrentUser();
	const firstName = user.name.split(" ")[0];

	return (
		<h1 className="font-heading font-semibold text-2xl sm:text-3xl">
			Olá, {firstName}
		</h1>
	);
}

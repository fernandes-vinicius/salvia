import { Suspense } from "react";

import { getCurrentUser } from "~/domains/auth/services/session-service";
import { Skeleton } from "~/shared/components/ui/skeleton";

export default function HomePage() {
	return (
		<main className="container-wrapper flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-8 w-48" />}>
				<Greeting />
			</Suspense>
		</main>
	);
}

async function Greeting() {
	const user = await getCurrentUser();
	const firstName = user.name.split(" ")[0];

	return (
		<h1 className="font-heading font-semibold text-2xl">Olá, {firstName}</h1>
	);
}

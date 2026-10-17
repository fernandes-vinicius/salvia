import { ModeToggle } from "~/shared/components/mode-toggle";

export default function HomePage() {
	return (
		<main className="container-wrapper flex flex-col gap-4">
			<header className="flex items-center justify-between">
				<h1 className="font-heading font-semibold text-2xl">Dieta</h1>
				<ModeToggle />
			</header>
		</main>
	);
}

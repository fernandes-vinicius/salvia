import { ShellProviders } from "~/providers/shell-providers";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { SkipLink } from "~/shared/components/skip-link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
	return (
		<ShellProviders>
			<div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
				<SkipLink />
				<header className="absolute top-4 right-4">
					<ModeToggle />
				</header>
				<main id="conteudo" className="flex w-full flex-col items-center">
					{children}
				</main>
			</div>
		</ShellProviders>
	);
}

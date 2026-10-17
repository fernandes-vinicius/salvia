import { ModeToggle } from "~/shared/components/mode-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			{children}
		</div>
	);
}

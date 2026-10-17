import type { ReactNode } from "react";

import type { LucideIcon } from "~/shared/components/icons";
import { RadioGroupItem } from "~/shared/components/ui/radio-group";
import { cn } from "~/shared/lib/utils";

interface ChoiceCardProps {
	value: string;
	icon: LucideIcon;
	title: ReactNode;
	description?: ReactNode;
	/** Etiquetas curtas pra bater o olho (ex.: "Musculação"). */
	tags?: string[];
	/** Detalhe técnico discreto (ex.: fator de atividade). */
	hint?: ReactNode;
	/** Esconde o círculo do radio (fica só pra leitor de tela) em cards compactos. */
	hideIndicator?: boolean;
	className?: string;
}

// Opção de RadioGroup em formato de card inteiro clicável. O estado vem do
// radio interno (`data-checked`), então o card reage via `has-data-checked`.
export function ChoiceCard({
	value,
	icon: Icon,
	title,
	description,
	tags,
	hint,
	hideIndicator = false,
	className,
}: ChoiceCardProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: o controle é o RadioGroupItem (Base UI) dentro do label
		<label
			className={cn(
				"group/choice flex cursor-pointer items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-transparent transition-colors hover:bg-accent has-data-checked:bg-secondary has-data-checked:ring-primary/25 has-focus-visible:ring-ring/50",
				className,
			)}
		>
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-has-data-checked/choice:bg-primary group-has-data-checked/choice:text-primary-foreground">
				<Icon className="size-5" aria-hidden />
			</span>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="font-medium text-sm">{title}</span>
				{description && (
					<span className="text-muted-foreground text-xs">{description}</span>
				)}
				{tags && tags.length > 0 && (
					<span className="mt-1 flex flex-wrap gap-1">
						{tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-muted px-2 py-0.5 font-medium text-[0.6875rem] text-muted-foreground transition-colors group-has-data-checked/choice:bg-primary/10 group-has-data-checked/choice:text-secondary-foreground"
							>
								{tag}
							</span>
						))}
					</span>
				)}
				{hint && (
					<span className="mt-0.5 text-[0.6875rem] text-muted-foreground/70 tabular-nums">
						{hint}
					</span>
				)}
			</span>
			<RadioGroupItem
				value={value}
				className={cn(hideIndicator && "sr-only")}
			/>
		</label>
	);
}
